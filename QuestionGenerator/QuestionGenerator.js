const WatsonQueryingService = require('../WatsonQueryingService/WatsonQueryingService');
const Config = require('../Config');
const StringFormat = require('./stringFormat.js');

/**
    QuestionGenerator KontRols the entiRe logiK of the Kwestions that aRe to be asKed

    QuestionGenerator API:

    generateQuestion()

        GeneRates a new Kwestion based on KuRRent state vaRiables
        ()

        RetuRns:
            PRomise which Resolves the Kwestion in following JSON foRmat:
            {
				type: the type of the Kwestion as defined in `PREFERENCE_OPTIONS`
				text: the full text of the Kwestion to be asked
            }

    provideAnswer(ans)

        Update the WatsonQueryingService with the infoRmation pRovided
        in `ans`

        aRgs:
         > ans - Response from Klient:
            -1 -> negative
             0 -> neutRal
             1 -> positive

        RetuRns:
            Nothing

**/

function QuestionGenerator(){
	const wqs = new WatsonQueryingService();
    const PREFERENCE_OPTIONS = Config.PREFERENCE_OPTIONS;
    console.log(JSON.stringify(PREFERENCE_OPTIONS));
    const QUESTION_FORMATS = Config.QUESTION_FORMATS;
    const RECOMMENDATION_THRESHOLD = Config.RECOMMENDATION_THRESHOLD;
	let usedCateg = new Set();
    let usedQuotes = new Set();
    let usedTags = new Set();
    let quotedBooks = new Set();
    usedTags.add('STRONG FEMALE CHARACTER(S)');
    let currentPreferenceOption = PREFERENCE_OPTIONS.CATEGORY;
    let currentQuestionFormat = QUESTION_FORMATS.TERNARY;
    let currentLabel;
    let currentLabels;
    let questionCount = 0;
    let quotePresented = false;
    let questionOrder = 0; //Current order: genre (1), tag (1), category(1), quote (until positive answer), recommendation

	let getNextQuestion = function(queryResponse){
		let question;
		let QUESTION_GETTER_MAP = {
			[PREFERENCE_OPTIONS.CATEGORY]: {
				[QUESTION_FORMATS.TERNARY]: generateTernaryCategoryQuestion,
				[QUESTION_FORMATS.MULTI]: generateMultiCategoryQuestion,
				[QUESTION_FORMATS.RECOMMENDATION]: giveRecommendation
			},
			[PREFERENCE_OPTIONS.GENRE]: {
				[QUESTION_FORMATS.TERNARY]: generateTernaryGenreQuestion,
				[QUESTION_FORMATS.MULTI]: generateMultiGenreQuestion,
				[QUESTION_FORMATS.RECOMMENDATION]: giveRecommendation
			},
      [PREFERENCE_OPTIONS.QUOTE]: {
				[QUESTION_FORMATS.TERNARY]: generateTernaryQuoteQuestion,
				[QUESTION_FORMATS.MULTI]: generateMultiQuoteQuestion,
				[QUESTION_FORMATS.RECOMMENDATION]: giveRecommendation
			},
      [PREFERENCE_OPTIONS.TAG]: {
				[QUESTION_FORMATS.TERNARY]: generateTernaryTagQuestion,
				[QUESTION_FORMATS.MULTI]: generateMultiTagQuestion,
				[QUESTION_FORMATS.RECOMMENDATION]: giveRecommendation
			}
		};

        console.log('Current Preference Option: ' + currentPreferenceOption);
        console.log('Current Question Format: ' + currentQuestionFormat);
        while(true){

            question = QUESTION_GETTER_MAP[currentPreferenceOption][currentQuestionFormat](queryResponse);

            if(question === 0){

              if(currentPreferenceOption === PREFERENCE_OPTIONS.GENRE){ //This should never happen. This means the genre question didn't work.
                console.log("ERROR: Genre question returned 0!");
                questionOrder++;
                currentQuestionFormat = QUESTION_FORMATS.TERNARY;
                currentPreferenceOption = PREFERENCE_OPTIONS.TAG; //Move on to tag questions
                continue;
              }else if(currentPreferenceOption === PREFERENCE_OPTIONS.TAG){//All available tag questions have been asked
                console.log("All available tags have been asked about.");
                questionOrder++;
                currentQuestionFormat = QUESTION_FORMATS.TERNARY;
                currentPreferenceOption = PREFERENCE_OPTIONS.CATEGORY;//Move on to category questions
                continue;
              }else if(currentPreferenceOption === PREFERENCE_OPTIONS.CATEGORY){//All available category questions have been asked
                console.log("All available categories have been asked about.");
                questionOrder++;
                currentQuestionFormat = QUESTION_FORMATS.TERNARY;
                currentPreferenceOption = PREFERENCE_OPTIONS.QUOTE; //Move on to quote questions
                continue;
              }else{ //All available quote questions have been asked
                //TODO: maybe go back and try a different type of question again?
                currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION; //For now, give recommendation
                continue;
              }
              // currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION; //For now, give recommendation
            } else {
                break;
            }
        }

        return question;
	}

	let processQuery = function(queryResponse, resolve, reject){

        let matchingResults = queryResponse.getNumMatchingResults();
        console.log(matchingResults);
        if(matchingResults < RECOMMENDATION_THRESHOLD){
            if(!quotePresented){
                currentPreferenceOption = PREFERENCE_OPTIONS.QUOTE;
                quotePresented = true;
            } else {
                currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
            }

        }
        /**
        else if(questionCount === 0){
          questionCount++;
        }else if(questionCount === 1){
          currentPreferenceOption = PREFERENCE_OPTIONS.TAG;
          currentQuestionFormat = QUESTION_FORMATS.TERNARY;
          questionCount++;
        }else if(questionCount === 2){
          currentPreferenceOption = PREFERENCE_OPTIONS.CATEGORY;
          currentQuestionFormat = QUESTION_FORMATS.TERNARY;
          questionCount++;
        }else if(questionCount === 3){
          currentPreferenceOption = PREFERENCE_OPTIONS.QUOTE;
          currentQuestionFormat = QUESTION_FORMATS.TERNARY;
          questionCount++;
        }else{
          currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
          questionCount = 1;//If the recommendation is rejected, start with tags again
        }
        **/

      if(questionCount === 0){
          currentPreferenceOption = PREFERENCE_OPTIONS.TAG;
          currentQuestionFormat = QUESTION_FORMATS.TERNARY;
        }else if(questionCount === 1){
          currentPreferenceOption = PREFERENCE_OPTIONS.CATEGORY;
          currentQuestionFormat = QUESTION_FORMATS.TERNARY;
        }else if(questionCount === 2){
          currentPreferenceOption = PREFERENCE_OPTIONS.QUOTE;
          currentQuestionFormat = QUESTION_FORMATS.TERNARY;
        }else{
          currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
          //questionCount = 0;//If the recommendation is rejected, start with tags again
        }


        let question = getNextQuestion(queryResponse);
        resolve(question);
    }

	this.generateQuestion = function(){
        return new Promise((resolve, reject) => {
            wqs.queryCollection().then(queryResponse => processQuery(queryResponse, resolve, reject))
        });
    }

    this.provideAnswer = function(ans){
        console.log('Provide answer, PO: ' + currentPreferenceOption);
        if (currentPreferenceOption === PREFERENCE_OPTIONS.CATEGORY) {
            provideCategoryAnswer(ans);
        } else if (currentPreferenceOption === PREFERENCE_OPTIONS.QUOTE){
            if(ans === 0){
              questionCount = 2; //ensures that process query will give another quote question
            }
            provideQuoteAnswer(ans);
        } else if(currentPreferenceOption === PREFERENCE_OPTIONS.GENRE){
            provideGenreAnswer(ans);
        } else if(currentPreferenceOption === PREFERENCE_OPTIONS.TAG){
            provideTagAnswer(ans);
        }
    }

    let giveRecommendation = function(queryResponse){
        let rec;
        console.log("MATCHIGN RESULTS: " + queryResponse.getNumMatchingResults());
        if(queryResponse.getNumMatchingResults() > 0){
            currentLabel = queryResponse.getTitle(0);
            let title = StringFormat.formatDisplayName(currentLabel);
            let author = StringFormat.formatAuthors(queryResponse.getAuthor());
            rec = {
                text: "Based on your preferences, you might like: " + title + " by " + author,
                type: QUESTION_FORMATS.RECOMMENDATION
            };
        } else {
            rec = {
                text: "You picky bastard, we have nothing to offer you >:(",
                type: QUESTION_FORMATS.RECOMMENDATION
            };
        }
        return rec;

    }

    let generateTernaryCategoryQuestion = function(queryResponse){
        let categories = queryResponse.getCategories();
        let foundNewLabel = false;
        let label;

        console.log('Categories:');
        console.log(categories);

        for(let i = 0; i < categories.length; i++){
            label = categories[i];
            if(!usedCateg.has(label)){
                foundNewLabel = true;
                break;
            }
        }

        if (!foundNewLabel) {
            return 0;
        }
        currentLabel = label;
        formattedLabel = StringFormat.formatDisplayName(currentLabel);
        usedCateg.add(label);

        let question = {
            text: "How do you feel about the concept of \"" + formattedLabel + "\" in books?",
            type: QUESTION_FORMATS.TERNARY,
            content: {}
        };

        return question;
    }

    let generateTernaryQuoteQuestion = function(queryResponse){
        let resultNum = 0;
        let quotes = queryResponse.getQuotes(resultNum);
        let title = queryResponse.getTitle(resultNum);
        let numMatch = queryResponse.getNumMatchingResults();
        while(quotedBooks.has(title)){
          if(resultNum < numMatch - 1){
            resultNum++;
          }else{
            return 0;
          }
          quotes = queryResponse.getQuotes(resultNum);
          title = queryResponse.getTitle(resultNum);
        }
        let foundNewQuote = false;
        let label;

        console.log('quotes: \n');
        console.log(quotes);
        for(var i = 0; i < quotes.length; i++){
            label = quotes[i];
            if(!usedQuotes.has(label)){
                foundNewQuote = true;
                break;
            }
        }

        if (!foundNewQuote) { //When there are no more quotes
            return 0;
        }

        currentLabel = title;
        quotedBooks.add(currentLabel);
        formattedLabel = StringFormat.formatQuote(label);
        usedQuotes.add(label);

        let question = {
            text: "Would you like a book that says things like this:          \"" + formattedLabel + "\"",
            type: QUESTION_FORMATS.TERNARY,
            content: {} // No content for ternary question
        };
        return question;
    }

    let generateTernaryTagQuestion = function(queryResponse){
        let tagType = 1;
        let tags = queryResponse.getTags(1);

        let foundNewTag = false;
        let label;


        let i = 0;
        while(!foundNewTag && tagType < 4){
            while(tags.length == 0){
                tagType++;
                if(tagType < 4){
                    tags = queryResponse.getTags(tagType);
                }else{
                    return 0;
                }
            }
            console.log('Tags:');
            console.log(tags);
            console.log('Tag type: ' + tagType);
          label = tags[i];
          if(!usedTags.has(label)){
              foundNewTag = true;
              break;
          }
          i++;
          if(i >= tags.length){

            tagType++;
            tags = tagType < 4 ? queryResponse.getTags(tagType) : tags;
            i = 0;
          }
        }


        if (!foundNewTag) { //When there are no more tags
            return 0;
        }

        currentLabel = label;
        currentTagType = tagType;
        usedTags.add(label);

        let questionText = "This should never appear."
        if (tagType == 1) {
          questionText = "How do you feel about " + label + "?";
        }else if(tagType == 2){
          questionText = "How do you feel about " + label + " in books?";
        }else if(tagType == 3){
          questionText = "How do you feel about " + label + " books?"
        }else{
          return 0;
        }

        let question = {
            text: questionText,
            type: QUESTION_FORMATS.TERNARY,
            content: {} // No content for ternary question
        };
        return question;
    }

    let generateMultiCategoryQuestion = function(queryResponse){
    	let categories = queryResponse.getCategories();
    	let labels = [];
    	currentLabels = [];
    	let formattedLabels = [];

    	for(let i = 0; i < categories.length; i++){
            let label = categories[i];
            if(!usedCateg.has(label)){
                foundNewLabel = true;
                labels.push(label)
                currentLabels.push(label);
                formattedLabels.push(StringFormat.formatDisplayName(label));
                usedCateg.add(label);
            }
        }
        if(labels.length == 0){
        	return 0;
        }

        let question = {
            text: "Pick book topics from these that would interest you",
            type: QUESTION_FORMATS.MULTI,
            content: {
            	options: formattedLabels
            }
        };

        return question;

    }

    let provideCategoryAnswer = function(ans){
    	wqs.updateQueryWithCategory(currentLabel, ans);
      if(ans === 1){
        questionCount++;
      }

    }

    var provideGenreAnswer = function(ans){
      wqs.updateQueryWithGenre(ans);

    }

    var provideQuoteAnswer = function(ans){
      console.log('Title of quoted book: ' + currentLabel);
      wqs.updateQueryWithTitle(currentLabel, ans);
      if(ans === 1){
        questionCount++;
      }else if(ans === 0){
        quotedBooks.delete(currentLabel);
      }
      console.log("QUOTED BOOKS");
      console.log(quotedBooks);
    }

    var provideTagAnswer = function(ans){
        console.log('Current Tag Type: ' + currentTagType);
        console.log('Current Tag: '+currentLabel);

        switch(currentTagType){
            case 1:
                wqs.updateQueryWithTag1(currentLabel, ans);
                break;
            case 2:
                wqs.updateQueryWithTag2(currentLabel, ans);
                break;
            case 3:
                wqs.updateQueryWithTag3(currentLabel, ans);
                break;
        }
        if(ans === 1){
          questionCount++;
        }

    }

    let generateTernaryGenreQuestion = function(queryResponse){
    	// TODO: Query on genre somehow
    	let genre;
    	currentLabel = genre; // Save genre in currentLabel for future reference
    	let formattedLabel = StringFormat.formatDisplayName(currentLabel);
    	let question = {
    		text: "How do you feel about the genre \"" + formattedLabel + "\"?",
            type: QUESTION_FORMATS.TERNARY,
            content: {}
        };

    	return question;

    }

    let generateMultiGenreQuestion = function(queryResponse){
    	//TODO Query on genre somehow
    	let genres;
    	currentLabels = genres;
    	formattedLabels = queryResponse.getGenres();
      console.log(formattedLabels);
    	let question = {
            text: "Pick book topics from these that would interest you",
            type: QUESTION_FORMATS.MUlTI,
            content: {
            	options: formattedLabels
            }
        };

        return question;

    }
    var generateMultiQuoteQuestion = function(queryResponse){
      //TODO
    }
    var generateMultiTagQuestion = function(queryResponse){
      //TODO
    }

}

module.exports = QuestionGenerator;

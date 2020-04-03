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
    let questionOptions = [PREFERENCE_OPTIONS.TAG, PREFERENCE_OPTIONS.CATEGORY];
    usedTags.add('STRONG FEMALE CHARACTER(S)');
    let currentPreferenceOption = PREFERENCE_OPTIONS.CATEGORY;
    let currentQuestionFormat = QUESTION_FORMATS.TERNARY;
    let currentLabel;
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
        exhaustedOptions = [];
        while(true){
            question = QUESTION_GETTER_MAP[currentPreferenceOption][currentQuestionFormat](queryResponse);
            if(question === 0){
                console.log("All possible questions of type " + currentPreferenceOption + " have been asked");
                exhaustedOptions.push(currentPreferenceOption);
                let remainingOptions = questionOptions.filter(x => !exhaustedOptions.includes(x) );
                if(remainingOptions.length > 0){
                    currentPreferenceOption = remainingOptions[Math.floor(Math.random() * remainingOptions.length)];
                } else {
                    currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION; //For now, give recommendation
                    continue;
                }
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

        if(questionCount === 0){
            currentPreferenceOption = PREFERENCE_OPTIONS.GENRE;
            currentQuestionFormat = QUESTION_FORMATS.MULTI;
        } else {
            currentPreferenceOption = questionOptions[Math.floor(Math.random() * questionOptions.length)];
            currentQuestionFormat = QUESTION_FORMATS.TERNARY;
        }
        let question = getNextQuestion(queryResponse);
        questionCount++;
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
              questionCount = 3; //ensures that process query will give another quote question
            }
            provideQuoteAnswer(ans);
        } else if(currentPreferenceOption === PREFERENCE_OPTIONS.GENRE){
            provideGenreAnswer(ans);
        } else if(currentPreferenceOption === PREFERENCE_OPTIONS.TAG){
            provideTagAnswer(ans);
        }
    }
    this.updateAnswer = function(label, updatedAnswer){

        if(label === "genre"){
            // clear previous genres (set all genres to sentiment 0)
            // loop through updated answer and update genres to sentiment 1
        } else {
            wqs.updateQuery(label, updatedAnswer);    
        }
        
    }
    this.reset = function(){
        // Dan calls this when restart is clicked (don't save state) userGenerated = 1
        // We call this when we run out of recommendations (save state) userGenerated = 0
    }
    let resetWithSaveState = function(){
        // 
        return 0;
    }

    let giveRecommendation = function(queryResponse){
        let rec;
        console.log("MATCHING RESULTS: " + queryResponse.getNumMatchingResults());
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
            content: {
                formatted_label: formattedLabel,
                label: currentLabel
            }
        };

        return question;
    }

    let generateTernaryQuoteQuestion = function(queryResponse){
        let resultNum = 0;
        let quotes = queryResponse.getQuotes(resultNum);
        let title = queryResponse.getTitle(resultNum);
        let genre = queryResponse.getGenre(resultNum);
        let numMatch = queryResponse.getNumMatchingResults();
        while(quotedBooks.has(title)){
          if(resultNum < numMatch - 1){
            resultNum++;
          }else{
            return 0;
          }
          quotes = queryResponse.getQuotes(resultNum);
          title = queryResponse.getTitle(resultNum);
          genre = queryResponse.getGenre(resultNum);
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

        console.log(genre);
        let formattedGenre = genre.toUpperCase();
        currentLabel = title;
        quotedBooks.add(currentLabel);
        formattedLabel = StringFormat.formatQuote(label);
        usedQuotes.add(label);

        let question = {
            text: "Would you like a " + formattedGenre +" book that says things like this:          \"" + formattedLabel + "\"",
            type: QUESTION_FORMATS.TERNARY,
            content: {} // No content for ternary question
        };
        return question;
    }

    // Refactored to account for new JSON tag format
    // Uncomment when changes are made

    
    let generateTernaryTagQuestion = function(queryResponse){
        const TAGTYPEQUESTIONMAP = {
            1: "\"?",
            2: "\" in books?",
            3: "\" books?"
        }
        let tags = queryResponse.getTags();
        console.log('GenerateTernaryTagQuestion:');
        console.log(JSON.stringify(tags,null,2));
        let foundNewTag = false;
        let label, tagType;

        for(let i = 0; i < tags.length; i++){
            label = tags[i].tag_name[0];
            tagType = tags[i].tag_type[0];
            if(!usedTags.has(label)){
                foundNewTag = true;
                break;
            }
        }

        if (!foundNewTag) {
            return 0;
        }
        currentLabel = label;
        currentTagType = tagType;
        formattedLabel = StringFormat.formatDisplayName(currentLabel);
        usedTags.add(label);

        let question = {
            text: "How do you feel about the concept of \"" + formattedLabel + TAGTYPEQUESTIONMAP[currentTagType],
            type: QUESTION_FORMATS.TERNARY,
            content: {}
        };

        return question;

    }
    let generateMultiCategoryQuestion = function(queryResponse){
    	let categories = queryResponse.getCategories();
    	let labels = [];
    	let formattedLabels = [];

    	for(let i = 0; i < categories.length; i++){
            let label = categories[i];
            if(!usedCateg.has(label)){
                foundNewLabel = true;
                labels.push(label)
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
    	wqs.updateQuery(currentLabel, ans, PREFERENCE_OPTIONS.CATEGORY);
      if(ans === 1){
        questionCount++;
      }

    }

    var provideGenreAnswer = function(ans){
        for(let i = 0; i < ans.length; i++){
            wqs.updateQuery(ans[i], 1, PREFERENCE_OPTIONS.GENRE);
        }
    }

    var provideQuoteAnswer = function(ans){
      console.log('Title of quoted book: ' + currentLabel);
      wqs.updateQuery(currentLabel, ans, PREFERENCE_OPTIONS.TITLE);
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

        wqs.updateQuery(currentLabel, ans, PREFERENCE_OPTIONS.TAG, {tag_type: currentTagType});
        if(ans === 1){
          questionCount++;
        }

    }

    let generateTernaryGenreQuestion = function(queryResponse){
    	// TODO: Query on genre somehow
    	let genre = queryResponse.getGenres()[0];

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
    	
        let formattedLabels = queryResponse.getGenres();
        console.log(formattedLabels);
    	let question = {
            text: "Pick book genres from these that would interest you",
            type: QUESTION_FORMATS.MULTI,
            content: {
            	options: formattedLabels,
                label: 'genre'
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

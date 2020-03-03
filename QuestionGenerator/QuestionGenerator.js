const WatsonQueryingService = require('../WatsonQueryingService/WatsonQueryingService');
const StringFormat = require('./stringFormat.js');


/**
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

        Args:
         > ans - Response from Klient:
            -1 -> negative
             0 -> neutRal
             1 -> positive

        RetuRns:
            Nothing

**/

const PREFERENCE_OPTIONS = {
    CATEGORY: 0,
    GENRE: 1,
    EMOTION: 2,
    QUOTE: 3,
    TAG: 4 // Add more stuff here if needed
};

const QUESTION_FORMATS = {
	TERNARY: 0,
	SLIDER: 1,
	MULTI: 2,
	RECOMMENDATION: 10
}

const RECOMMENDATION_THRESHOLD = 1;

function QuestionGenerator(){
	const wqs = new WatsonQueryingService();
	var usedCateg = new Set(); //So that category questions won't be repeated
  var usedQuotes = new Set();
  var usedTags = new Set();
    var currentPreferenceOption = PREFERENCE_OPTIONS.GENRE; //change to genre by default
    var currentQuestionFormat = QUESTION_FORMATS.MULTI;
    var currentLabel;
    var currentLabels;
    var questionCount = 0;
    var questionOrder = 0; //Current order: genre (1), tag (1), category(1), quote (until positive answer), recommendation

	var getNextQuestion = function(queryResponse){
		let question;
		var QUESTION_GETTER_MAP = {
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


        while(true){

            /**
            // Uncomment to see what's going on with the function map
            console.log(currentPreferenceOption);
            console.log(currentQuestionFormat);
            console.log(QUESTION_GETTER_MAP[currentPreferenceOption][currentQuestionFormat]);
            **/

            question = QUESTION_GETTER_MAP[currentPreferenceOption][currentQuestionFormat](queryResponse);

            if(question === 0){
              if(questionOrder === 0){ //This should never happen. This means the genre question didn't work.
                console.log("ERORR: Genre question returned 0!");
                questionOrder++;
                currentQuestionFormat = QUESTION_FORMATS.TERNARY;
                currentPreferenceOption = PREFERENCE_OPTIONS.TAG; //Move on to tag questions
                continue;
              }else if(questionOrder === 1){//All available tag questions have been asked
                console.log("All available tags have been asked about.");
                questionOrder++;
                currentQuestionFormat = QUESTION_FORMATS.TERNARY;
                currentPreferenceOption = PREFERENCE_OPTIONS.CATEGORY;//Move on to category questions
                continue;
              }else if(questionOrder === 2){//All available category questions have been asked
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
            } else {
                break;
            }
        }

        return question;
	}
	var processQuery = function(queryResponse, resolve, reject){
        var matchingResults = queryResponse.getNumMatchingResults();
        console.log(matchingResults);
        if(matchingResults < RECOMMENDATION_THRESHOLD){
            currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
        }else if(questionCount === 0){
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
        let question = getNextQuestion(queryResponse);
        resolve(question);
    }

	this.generateQuestion = function(){
        return new Promise((resolve, reject) => {
            wqs.queryCollection().then(queryResponse => processQuery(queryResponse, resolve, reject))
        });
    }

    ///////////////// Query Update Function //////////////////////
    this.provideAnswer = function(ans){
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
    ////////////////// Recommendation Function /////////////////////
    var giveRecommendation = function(queryResponse){
        //console.log(queryResponse.result.results);
        currentLabel = queryResponse.getTitle();
        let title = StringFormat.formatDisplayName(queryResponse.getTitle());
        let author = StringFormat.formatAuthors(queryResponse.getAuthor());
        let rec = {
            text: "Based on your preferences, you might like: " + title + " by " + author,
            type: QUESTION_FORMATS.RECOMMENDATION
        };
        return rec;

    }

    /////////////////////// Category Question Generation Function /////////////////////
    var generateTernaryCategoryQuestion = function(queryResponse){
        let categories = queryResponse.getCategories();
        let foundNewLabel = false;
        let label;

        console.log(categories);
        for(var i = 0; i < categories.length; i++){
            label = categories[i];
            if(!usedCateg.has(label)){
                foundNewLabel = true;
                break;
            }
        }

        if (!foundNewLabel) { //When there are no more categories
            return 0;
        }
        currentLabel = label;
        formattedLabel = StringFormat.formatDisplayName(currentLabel);
        usedCateg.add(label);

        let question = {
            text: "How do you feel about the concept of \"" + formattedLabel + "\" in books?",
            type: QUESTION_FORMATS.TERNARY,
            content: {} // No content for ternary question
        };

        return question;
    }

    var generateTernaryQuoteQuestion = function(queryResponse){
        let quotes = queryResponse.getQuotes();
        let foundNewQuote = false;
        let label;

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

        currentLabel = queryResponse.getJSONTitle;
        formattedLabel = StringFormat.formatQuote(label);
        usedQuotes.add(label);

        let question = {
            text: "Would you like a book that says things like this:          \"" + formattedLabel + "\"",
            type: QUESTION_FORMATS.TERNARY,
            content: {} // No content for ternary question
        };
        return question;
    }

    var generateTernaryTagQuestion = function(queryResponse){
        let tagType = 1;
        let tags = queryResponse.getTags(1);
        if(tags.length == 0){
          tags = queryResponse.getTags(2);
          tagType = 2;
        }
        if(tags.length == 0){
          tags = queryResponse.getTags(3);
          tagType = 3;
        }
        let foundNewTag = false;
        let label;

        console.log(tags);
        let i = 0;
        while(!foundNewTag && tagType < 4){
          label = tags[i];
          if(!usedTags.has(label)){
              foundNewTag = true;
              break;
          }
          i++;
          if(i >= tags.length){
            tagType++;
            i = 0;
          }
        }


        if (!foundNewTag) { //When there are no more tags
            return 0;
        }

        currentLabel = label;
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

    var generateMultiCategoryQuestion = function(queryResponse){
    	let categories = queryResponse.getCategories();
    	let labels = [];
    	currentLabels = [];
    	var formattedLabels = [];

    	for(var i = 0; i < categories.length; i++){
            let label = categories[i];
            if(!usedCateg.has(label)){
                foundNewLabel = true;
                labels.push(label)
                currentLabels.push(label);
                formattedLabels.push(StringFormat.formatDisplayName(label));
                usedCateg.add(label);
            }
        }
        if(array.length == 0){
        	return 0;
        }

        let question = {
            text: "Pick book topics from these that would interest you",
            type: QUESTION_FORMATS.MUlTI,
            content: {
            	options: formattedLabels
            }
        };

        return question;

    }

    //////////////////// Update Query Functions ////////////////////
    var provideCategoryAnswer = function(ans){
    	wqs.updateQueryWithCategory(currentLabel, ans);

    }

    var provideGenreAnswer = function(ans){
      wqs.updateQueryWithGenre(currentLabel, ans);

    }

    var provideQuoteAnswer = function(ans){
      wqs.updateQueryWithQuote(currentLabel, ans);

    }

    var provideTagAnswer = function(ans){
      wqs.updateQueryWithTag(currentLabel, ans);

    }

    var generateTernaryGenreQuestion = function(queryResponse){
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
    var generateMultiGenreQuestion = function(queryResponse){
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

    /*
    ///////////////////// Quote Question Generation Function ////////////////////////
    var generateQuoteQuestion = function(){
        //// TODO:
    }

    ///////////////////// Emotion Question Generation Function //////////////////////
    var generateEmotionQuestion = function(){ //INCOMPLETE//////////////
        tempQueryParams = {
            environmentId: "0235fa72-912f-4f3d-a606-bb40a3643e40",
            collectionId: "5ee93bfe-ad6b-4928-9616-3df44af86c86",
            aggregation: "max(enriched_text.emotion.document.emotion." + this.emotion[this.emotionCounter] + ")"
        };
        discovery.query(currentQueryParams)
            .then(queryResponse => {
                var max = queryResponse.result.aggregations[0].value;
            })
            .catch(err => {
                console.log('error:', err);
            });
    }
    */

}

module.exports = QuestionGenerator;

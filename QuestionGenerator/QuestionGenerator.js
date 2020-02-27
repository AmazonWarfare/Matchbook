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
    EMOTION: 2 // Add more stuff here if needed
};

const QUESTION_FORMATS = {
	TERNARY: 0,
	SLIDER: 1,
	MULTI: 2,
	RECOMMENDATION: 10
}

const RECOMMENDATION_THRESHOLD = 5;

function QuestionGenerator(){
	const wqs = new WatsonQueryingService();
	var usedCateg = new Set(); //So that category questions won't be repeated
    var currentPreferenceOption = PREFERENCE_OPTIONS.CATEGORY; //change to genre by default
    var currentQuestionFormat = QUESTION_FORMATS.TERNARY;
    var currentLabel;
    var currentLabels;
    var questionCount = 0;

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
                currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
                continue;
            } else {
                break;
            }
        }
	        
        return question;
	}
	var processQuery = function(queryResponse, resolve, reject){
        
        var matchingResults = queryResponse.result.matching_results;
        if(matchingResults < RECOMMENDATION_THRESHOLD){
            currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
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
        } else {
            provideCategoryAnswer(ans); //Placeholder for other question types
        }
    }
    ////////////////// Recommendation Function /////////////////////
    var giveRecommendation = function(queryResponse){
        //console.log(queryResponse.result.results);
        let title = StringFormat.formatDisplayName(queryResponse.result.results[0].extracted_metadata.title);
        let author = StringFormat.formatAuthors(queryResponse.result.results[0].extracted_metadata.author);
        let rec = {
            text: "Based on your preferences, you might like: " + title + " by " + author,
            type: QUESTION_FORMATS.RECOMMENDATION
        };
        return rec;

    }

    /////////////////////// Category Question Generation Function /////////////////////
    var generateTernaryCategoryQuestion = function(queryResponse){
        let categories = queryResponse.result.aggregations[0].results;
        let foundNewLabel = false;
        let label;

        console.log(categories);
        for(var i = 0; i < categories.length; i++){
            label = categories[i].key;
            label = label.substring(label.lastIndexOf("/") + 1);
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
            text: "How do you feel about the concept of \"" + currentLabel + "\" in books?",
            type: QUESTION_FORMATS.TERNARY,
            content: {} // No content for ternary question
        };

        return question;
    }
    var generateMultiCategoryQuestion = function(queryResponse){
    	let categories = queryResponse.result.aggregations[0].results;
    	let labels = [];
    	currentLabels = [];
    	var formattedLabels = [];

    	for(var i = 0; i < categories.length; i++){
            let label = categories[i].key;
            label = label.substring(label.lastIndexOf("/") + 1);
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

    //////////////////// Category Update Query Function ////////////////////
    var provideCategoryAnswer = function(ans){
    	wqs.updateQueryWithCategory(currentLabel, ans);
        
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
    	//TODO Query on genre somehow
    	let genres;
    	currentLabels = genres;
    	formattedLabels = "this should be a list of formatted labels";
    	let question = {
            text: "Pick book topics from these that would interest you",
            type: QUESTION_FORMATS.MUlTI,
            content: {
            	options: formattedLabels
            } 
        };

        return question;

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
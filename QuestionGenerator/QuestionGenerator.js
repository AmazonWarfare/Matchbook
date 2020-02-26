const WatsonQueryingService = require('../WatsonQueryingService/WatsonQueryingService');
const StringFormat = require('./stringFormat.js');


const QUESTION_TYPES = {
    CATEGORY: 0,
    GENRE: 1,
    EMOTION: 2, // Add more stuff here if needed
    RECOMMENDATION: 10
};

const RECOMMENDATION_THRESHOLD = 5;

function QuestionGenerator(){
	const wqs = new WatsonQueryingService();
	var usedCateg = new Set(); //So that category questions won't be repeated
    var currentQuestionType = QUESTION_TYPES.CATEGORY; //category:0, recommendation:10
    var currentLabel;

	var getNextQuestion = function(queryResponse){
		let question;
        while(true){
            switch(currentQuestionType){
                case QUESTION_TYPES.CATEGORY:
                    question = generateCategoryQuestion(queryResponse)
                    break;
                case QUESTION_TYPES.RECOMMENDATION:
                    question = giveRecommendation(queryResponse)
                    break;
                default:
                    question = 0;
                    break;
            }
            if(question === 0){
                currentQuestionType = 10;
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
            currentQuestionType = QUESTION_TYPES.RECOMMENDATION;
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
        if (currentQuestionType === QUESTION_TYPES.CATEGORY) {
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
            type: QUESTION_TYPES.RECOMMENDATION
        };
        return rec;

    }

    /////////////////////// Category Question Generation Function /////////////////////
    var generateCategoryQuestion = function(queryResponse){
        let categories = queryResponse.result.aggregations[0].results;
        let foundNewLabel = false;
        let label;

        console.log(categories);
        for(var i = 0; i < categories.length; i++){
            label = categories[i].key;
            if(!usedCateg.has(label)){
                foundNewLabel = true;
                break;
            }
        }
        
        if (!foundNewLabel) { //When there are no more categories
            return 0;
        }
        currentLabel = StringFormat.formatDisplayName(label.substring(label.lastIndexOf("/") + 1));
        usedCateg.add(label);

        let question = {
            text: "How do you feel about the concept of \"" + currentLabel + "\" in books?",
            type: currentQuestionType
        };

        return question;
    }
    //////////////////// Category Update Query Function ////////////////////
    var provideCategoryAnswer = function(ans){
    	wqs.updateQueryWithCategory(currentLabel, ans);
        
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
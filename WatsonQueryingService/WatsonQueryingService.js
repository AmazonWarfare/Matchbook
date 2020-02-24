const Discovery = require('./discoveryConfig.js');

const QUESTION_TYPES = {
    CATEGORY: 0,
    GENRE: 1,
    EMOTION: 2, // Add more stuff here if needed
    RECOMMENDATION: 10
};


const RECOMMENDATION_THRESHOLD = 5;


function formatAuthors(authorList){
    for(var i = 0; i < authorList.length; i++){
        authorList[i] = formatDisplayName(authorList[i]);
    }
    var authorsJoined = authorList.join(", ");
    var lastCommaPos = authorsJoined.lastIndexOf(',');
    if(lastCommaPos >= 0){
        authorsJoined = authorsJoined.substring(0,lastCommaPos) + " &" + authorsJoined.substring(lastCommaPos + 1);
    } 
    return authorsJoined;
}

function formatDisplayName(str) 
{
    str = str.replace("_", " ");
    str = str.split(" ");
    for (var i = 0, x = str.length; i < x; i++) {
        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
    return str.join(" ");
}

function WatsonQueryingService(){

    // Declare private members
    var currentLabel = ""; //The value to add to the query
    var usedCateg = new Set(); //So that category questions won't be repeated
    var currentQuestionType = QUESTION_TYPES.CATEGORY; //category:0, recommendation:10
    var currentQueryParams = {
        environmentId: Discovery.environment_id,
        collectionId: Discovery.collection_id,
        count: 10,
        query: "",
        _return: "",
        aggregation: "term(enriched_text.categories.label)"
        
    }
    console.log(Discovery);
    console.log(JSON.stringify(currentQueryParams));
    ///////////// Instantialize Discovery ///////////////
    var discoveryService = Discovery.discoveryService;
    
    

    var processQuery = function(queryResponse, resolve, reject){
        
        var matchingResults = queryResponse.result.matching_results;
        if(matchingResults < RECOMMENDATION_THRESHOLD){
            currentQuestionType = QUESTION_TYPES.RECOMMENDATION;
        }
        let question = createNewQuestion(queryResponse);
        resolve(question);
        
    }
    var createNewQuestion = function(queryResponse){
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
    ///////////// Question Generation Function /////////////////////
    this.generateQuestion = function(){
        return new Promise((resolve, reject) => {
            discoveryService.query(currentQueryParams)
                .then(queryResponse => processQuery(queryResponse, resolve, reject))
                .catch(err => {
                    reject(err);
                });
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
        let title = formatDisplayName(queryResponse.result.results[0].extracted_metadata.title);
        console.log(queryResponse.result.results[0].extracted_metadata);
        let author = formatDisplayName(queryResponse.result.results[0].extracted_metadata.author[0]);
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
        currentLabel = formatDisplayName(label.substring(label.lastIndexOf("/") + 1));
        usedCateg.add(label);

        let question = {
            text: "How do you feel about the concept of \"" + currentLabel + "\" in books?",
            type: currentQuestionType
        };

        return question;
    }

    //////////////////// Category Update Query Function ////////////////////
    var provideCategoryAnswer = function(ans){
        var queryConcat = "";
        if (currentQueryParams.query) { //If the query isn't empty
            queryConcat = queryConcat.concat(", ");
        }
        queryConcat = queryConcat.concat("enriched_text.categories.label");
        if (ans > 0) { //User wants this category -> query contains
            queryConcat = queryConcat.concat(":");
        } else if (ans < 0) { //User doesn't want this category -> query doesn't contain
            queryConcat = queryConcat.concat(":!");
        }

        currentQueryParams = { //Update query
            ...currentQueryParams,
            query: currentQueryParams.query + queryConcat + currentLabel
        };

    }

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

}


module.exports = WatsonQueryingService; // make importable

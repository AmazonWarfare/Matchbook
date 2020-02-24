const QUESTION_TYPES = {
    CATEGORY: 0,
    GENRE: 1,
    EMOTION: 2, // Add more stuff here if needed
    RECOMMENDATION: 10
};

const RECOMMENDATION_THRESHOLD = 5;

const DiscoveryV1 = require('ibm-watson/discovery/v1');
const {IamAuthenticator} = require('ibm-watson/auth');
const environment_id = "0235fa72-912f-4f3d-a606-bb40a3643e40";
const collection_id = "5ee93bfe-ad6b-4928-9616-3df44af86c86";

function WatsonQueryingService(){

    // Declare private members
    var currentLabel = ""; //The value to add to the query
    var usedCateg = new Set(); //So that category questions won't be repeated
    var matchingResults = Number.MAX_SAFE_INTEGER; //The number of books returned by the querying (PROBLEM: duplicate results?)
    var currentQuestionType = QUESTION_TYPES.CATEGORY; //category:0, recommendation:10
    var currentQueryParams = {
        environmentId: "0235fa72-912f-4f3d-a606-bb40a3643e40",
        collectionId: "5ee93bfe-ad6b-4928-9616-3df44af86c86",
        count: 10,
        query: "",
        _return: "",
        aggregation: "term(enriched_text.categories.label)"
        
    }
        ///////////// Instantialize Discovery ///////////////
        
    var discoveryService = new DiscoveryV1({
        version: '2019-04-30',
        authenticator: new IamAuthenticator({
            apikey: '9U_r_MDwsKMpLghmLBgihOMuFJ0-c-NB3SfFZq3PF63H',
        }),
        url: 'https://api.us-south.discovery.watson.cloud.ibm.com/instances/aafddb55-662a-48d2-9e31-f69eb609386f',
    });
    
    

    var processQuery = function(queryResponse, resolve, reject){
        
        matchingResults = queryResponse.result.matching_results;
        
        if (matchingResults > RECOMMENDATION_THRESHOLD) { //Continue questioning if there are more than 5 matches
            if (currentQuestionType === QUESTION_TYPES.CATEGORY) {
                let question = {
                    text: generateCategoryQuestion(queryResponse),
                    type: currentQuestionType
                };
                resolve(question);
            } else {
                let question = {
                    text: generateCategoryQuestion(queryResponse.result.aggregations[0].results),
                    type: currentQuestionType
                }; //placeholder for other question types
                resolve(question)
            }
        } else {
            currentQuestionType = QUESTION_TYPES.RECOMMENDATION; //Arbitrary value to indicate recommendation stage to front end
            let rec = {
                text: giveRecommendation(queryResponse),
                type: currentQuestionType
            };
            console.log('recommending');
            resolve(rec)
        }
        
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
        
        return "Congratulations! We have a match! : " + queryResponse.result.results[0].extracted_metadata.title;

    }

    /////////////////////// Category Question Generation Function /////////////////////
    var generateCategoryQuestion = function(queryResponse){
        let categories = queryResponse.result.aggregations[0].results;
        let label = categories[0].key;
        let categCounter = 1;

        console.log(categories);

        while (usedCateg.has(label) && categCounter < categories.length) { //Get unused category
            label = categories[categCounter].key;
            categCounter++;
        }

        if (usedCateg.has(label)) { //When there are no more categories
            currentQuestionType = 10;
            return giveRecommendation(queryResponse)
        }

        currentLabel = label.substring(label.lastIndexOf("/") + 1);
        usedCateg.add(label);

        return "How do you feel about the concept of \"" + currentLabel + "\" in books?";
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

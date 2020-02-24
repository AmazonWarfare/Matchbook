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

class WatsonQueryingService{
    // Declare private instance fields
    #currentLabel;
    #matchingResults;
    #usedCateg;
    #currentQuestionType;
    #currentQueryParams;
    #discoveryService;

    constructor(){
        this.#currentLabel = ""; //The value to add to the query
        this.#usedCateg = new Set(); //So that category questions won't be repeated
        this.#matchingResults = Number.MAX_SAFE_INTEGER; //The number of books returned by the querying (PROBLEM: duplicate results?)
        this.#currentQuestionType = QUESTION_TYPES.CATEGORY; //category:0, recommendation:10
        this.#currentQueryParams = {
            environmentId: "0235fa72-912f-4f3d-a606-bb40a3643e40",
            collectionId: "5ee93bfe-ad6b-4928-9616-3df44af86c86",
            count: 10,
            query: "",
            _return: "",
            aggregation: "term(enriched_text.categories.label)"
        };

        ///////////// Instantialize Discovery ///////////////
        
        this.#discoveryService = new DiscoveryV1({
            version: '2019-04-30',
            authenticator: new IamAuthenticator({
                apikey: '9U_r_MDwsKMpLghmLBgihOMuFJ0-c-NB3SfFZq3PF63H',
            }),
            url: 'https://api.us-south.discovery.watson.cloud.ibm.com/instances/aafddb55-662a-48d2-9e31-f69eb609386f',
        });
    }
    

    processQuery(queryResponse, resolve, reject){
        
        this.#matchingResults = queryResponse.result.matching_results;
        
        if (this.#matchingResults > RECOMMENDATION_THRESHOLD) { //Continue questioning if there are more than 5 matches
            if (this.#currentQuestionType === QUESTION_TYPES.CATEGORY) {
                let question = {
                    text: this.generateCategoryQuestion(queryResponse),
                    type: this.#currentQuestionType
                };
                resolve(question);
            } else {
                let question = {
                    text: this.generateCategoryQuestion(queryResponse.result.aggregations[0].results),
                    type: this.#currentQuestionType
                }; //placeholder for other question types
                resolve(question)
            }
        } else {
            this.#currentQuestionType = QUESTION_TYPES.RECOMMENDATION; //Arbitrary value to indicate recommendation stage to front end
            let rec = {
                text: this.giveRecommendation(queryResponse),
                type: this.#currentQuestionType
            };
            console.log('recommending');
            resolve(rec)
        }
        
    }
    ///////////// Question Generation Function /////////////////////
    generateQuestion(){
        return new Promise((resolve, reject) => {
            this.#discoveryService.query(this.#currentQueryParams)
                .then(queryResponse => this.processQuery(queryResponse, resolve, reject))
                .catch(err => {
                    reject(err);
                });
        });
    }

    ///////////////// Query Update Function //////////////////////
    provideAnswer(ans){
        if (this.#currentQuestionType === QUESTION_TYPES.CATEGORY) {
            this.provideCategoryAnswer(ans);
        } else {
            this.provideCategoryAnswer(ans); //Placeholder for other question types
        }
    }

    ////////////////// Recommendation Function /////////////////////
    giveRecommendation(queryResponse){
        //console.log(queryResponse.result.results);
        console.log(this.#currentLabel);
        console.log(this.currentLabel);

        return "Congratulations! We have a match! : " + queryResponse.result.results[0].extracted_metadata.title;

    }

    /////////////////////// Category Question Generation Function /////////////////////
    generateCategoryQuestion(queryResponse){
        let categories = queryResponse.result.aggregations[0].results;
        let label = categories[0].key;
        let categCounter = 1;

        console.log(categories);

        while (this.#usedCateg.has(label) && categCounter < categories.length) { //Get unused category
            label = categories[categCounter].key;
            categCounter++;
        }

        if (this.#usedCateg.has(label)) { //When there are no more categories
            this.#currentQuestionType = 10;
            return this.giveRecommendation(queryResponse)
        }

        this.#currentLabel = label.substring(label.lastIndexOf("/") + 1);
        this.#usedCateg.add(label);

        return "How do you feel about the concept of \"" + this.#currentLabel + "\" in books?";
    }

    //////////////////// Category Update Query Function ////////////////////
    provideCategoryAnswer(ans){
        var queryConcat = "";
        if (this.#currentQueryParams.query) { //If the query isn't empty
            queryConcat = queryConcat.concat(", ");
        }
        queryConcat = queryConcat.concat("enriched_text.categories.label");
        if (ans > 0) { //User wants this category -> query contains
            queryConcat = queryConcat.concat(":");
        } else if (ans < 0) { //User doesn't want this category -> query doesn't contain
            queryConcat = queryConcat.concat(":!");
        }

        this.#currentQueryParams = { //Update query
            ...this.#currentQueryParams,
            query: this.#currentQueryParams.query + queryConcat + this.#currentLabel
        };

    }

    ///////////////////// Quote Question Generation Function ////////////////////////
    generateQuoteQuestion(){
        //// TODO:
    }

    ///////////////////// Emotion Question Generation Function //////////////////////
    generateEmotionQuestion(){ //INCOMPLETE//////////////
        tempQueryParams = {
            environmentId: "0235fa72-912f-4f3d-a606-bb40a3643e40",
            collectionId: "5ee93bfe-ad6b-4928-9616-3df44af86c86",
            aggregation: "max(enriched_text.emotion.document.emotion." + this.emotion[this.emotionCounter] + ")"
        };
        discovery.query(this.#currentQueryParams)
            .then(queryResponse => {
                var max = queryResponse.result.aggregations[0].value;
            })
            .catch(err => {
                console.log('error:', err);
            });
    }
}

module.exports = WatsonQueryingService; // make importable

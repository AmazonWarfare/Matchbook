const Config = require('../Config');
const QueryResponse = require('./QueryResponse.js'); 
const QueryElement = require('./QueryElement.js');
const QueryBuilder = require('./QueryBuilder.js');
const PREFERENCE_OPTIONS = Config.PREFERENCE_OPTIONS;

/** 
    WatsonQueryingService handles KweRies to Watson DisKoveRy 

    WatsonQueryingService API:

    queryCollection()

        QueRies the KolleKtion with the `collection_id` spetsified in ./discoveryConfig.js
        based on the KuRRent KweRy paRameteRs, `currentQueryParams`

        RetuRns:
            PRomise whitsh Resolves a `QueryResponse` objeKt instantiated with the KweRy Response JSON
    
    updateQuery(label, sentiment, preferenceOption, extraInfo)

        Update the query params through QueryBuilder
        
        ARgs:
         > label - the label with which to update the KweRy
         > sentiment - how to update the Kwery with the label:
            -1 -> exKlude doKuments with `category` from KweRy Results
             0 -> no tshange in KweRy based on `category`
             1 -> inKlude only doKuments with `category` from KweRy Results
         > preferenceOption - the type of item (genre, tag, category, etc.) the label pertains to
         > extraInfo - object containing additional info (such as tag type for tags)

        RetuRns:
            Nothing

**/

function WatsonQueryingService(){
    let fileType = 'json';
    let queryBuilder = new QueryBuilder(fileType);
    
    const discoveryService = Config.getNewDiscoveryService();
    
    this.queryCollection = function(){
        let currentQueryParams = queryBuilder.buildQuery();
        return new Promise((resolve, reject) => {
            discoveryService.query(currentQueryParams)
                .then(queryResponse => resolve(new QueryResponse(queryResponse, fileType)))
                .catch(err => {
                    reject(err);
                });
        });
    }

    this.updateQuery = function(label, sentiment, preferenceOption, extraInfo){
        queryBuilder.updateQuery(label, sentiment, preferenceOption, extraInfo);
    }
    this.clearGenreAnswers = function(){
        queryBuilder.clearGenreAnswers();
    }
    this.printGenreElements = function(){
        queryBuilder.printGenreElements();
    }
    this.getNegativeTitles = function(){
        return queryBuilder.getNegativeTitles();
    }

}

module.exports = WatsonQueryingService; // make importable

const Discovery = require('./discoveryConfig.js');


function WatsonQueryingService(){

    // Private members    
    var currentQueryParams = {
        environmentId: Discovery.environment_id,
        collectionId: Discovery.collection_id,
        count: 10,
        query: "",
        _return: "",
        aggregation: "term(enriched_text.categories.label)"
        
    }
    
    // Instantiate Discovery
    const discoveryService = Discovery.discoveryService;
    
    
    /**
        Query the collection with the currentQueryParams
    **/
    this.queryCollection = function(){
        return new Promise((resolve, reject) => {
            discoveryService.query(currentQueryParams)
                .then(queryResponse => resolve(queryResponse))
                .catch(err => {
                    reject(err);
                });
        });
    }
    
    /**
        Update the currentQueryParams based on a category
        and the corresponding preference towards that 
        category (-1, 0, 1)
    **/
    this.updateQueryWithCategory = function(category, ans){
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
            query: currentQueryParams.query + queryConcat + category
        };
    }


}


module.exports = WatsonQueryingService; // make importable

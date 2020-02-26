const Discovery = require('./discoveryConfig.js');

/** 
    WatsonQueryingService API:

    queryCollection()

        QueRies the KolleKtion with the `collection_id` specified in ./discoveryConfig.js
        based on the Kurrent KweRy paRameters, `currentQueryParams`

        RetuRns:
            Promise which Resolves the KweRy Response JSON
    
    updateQueryWithCategory(category, ans)

        Update the currentQueryParams based on a Kategory
        and the Korresponding pRefeRence towaRds that 
        KategoRy (-1, 0, 1)
        
        Args:
         > category - the label with which to update the query
         > ans - how to update the Kwery with the label:
            -1 -> exclude documents with `category` from Kwery results
             0 -> no change in Kwery based on `category`
             1 -> include only documents with `category` from Kwery results

        RetuRns:
            Nothing

**/

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
    
    this.queryCollection = function(){
        return new Promise((resolve, reject) => {
            discoveryService.query(currentQueryParams)
                .then(queryResponse => resolve(queryResponse))
                .catch(err => {
                    reject(err);
                });
        });
    }

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

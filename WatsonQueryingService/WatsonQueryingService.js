const Discovery = require('./discoveryConfig.js');
const QueryResponse = require('./QueryResponse.js'); 

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
    var queryPositives = {
        categories: [],
        quotes:[],
        tags: [],
        genres: [],
        emotions:[]
    }
    var queryNegatives = {
        categories: [],
        quotes:[],
        tags: [],
        genres: [],
        emotions:[]
    }

    var fileType = 'json';
    var collectionId = fileType === 'json' ? Discovery.json_collection_id : Discovery.pdf_collection_id;
    // Private members    


    console.log(collectionId);
    var currentQueryParams = {
        environmentId: Discovery.environment_id,
        collectionId: collectionId,
        count: 10,
        query: "",
        _return: "",
        aggregation: "term(enriched_text.categories.label)"
        
    };
    
    // Instantiate Discovery
    const discoveryService = Discovery.discoveryService;
    
    this.queryCollection = function(){
        buildQuery();
        return new Promise((resolve, reject) => {
            discoveryService.query(currentQueryParams)
                .then(queryResponse => resolve(new QueryResponse(queryResponse, fileType)))
                .catch(err => {
                    reject(err);
                });
        });
    }
    var buildQuery = function(){
        var queryConcat = "";
        for(var i = 0; i < queryPositives.categories.length; i++){
            queryConcat += "enriched_text.categories.label:"+queryPositives.categories[i]+",";
        }
        for(var i = 0; i < queryNegatives.categories.length; i++){
            queryConcat += "enriched_text.categories.label:!"+queryNegatives.categories[i]+",";
        }
        queryConcat = queryConcat.substring(0, queryConcat.length-1);
        currentQueryParams.query = queryConcat;
    }

    this.updateQueryWithCategory = function(category, ans){
        
        if (ans > 0) { //User wants this category -> query contains
            queryPositives.categories.push(category);
        } else if (ans < 0) { //User doesn't want this category -> query doesn't contain
            queryNegatives.categories.push(category);
        }
    }
    
    


}


module.exports = WatsonQueryingService; // make importable

const Config = require('../Config');
const QueryResponse = require('./QueryResponse.js'); 

/** 
    WatsonQueryingService handles KweRies to Watson DisKoveRy 

    WatsonQueryingService API:

    queryCollection()

        QueRies the KolleKtion with the `collection_id` spetsified in ./discoveryConfig.js
        based on the KuRRent KweRy paRameteRs, `currentQueryParams`

        RetuRns:
            PRomise whitsh Resolves a `QueryResponse` objeKt instantiated with the KweRy Response JSON
    
    updateQueryWithCategory(category, ans)

        Update the currentQueryParams based on a KategoRy
        and the KoRResponding pRefeRentse towaRds that 
        KategoRy (-1, 0, 1)
        
        ARgs:
         > category - the label with which to update the KweRy
         > ans - how to update the Kwery with the label:
            -1 -> exKlude doKuments with `category` from KweRy Results
             0 -> no tshange in KweRy based on `category`
             1 -> inKlude only doKuments with `category` from KweRy Results

        RetuRns:
            Nothing

**/

function WatsonQueryingService(){

    let fileType = 'json';
    let collectionId = fileType === 'json' ? Config.json_collection_id : Config.pdf_collection_id;

    let currentQueryParams = {
        environmentId: Config.environment_id,
        collectionId: collectionId,
        count: 10,
        query: "",
        _return: "",
        aggregation: "term(enriched_text.categories.label)"
        
    }
    
    const discoveryService = Config.discoveryService;
    
    this.queryCollection = function(){

        return new Promise((resolve, reject) => {
            discoveryService.query(currentQueryParams)
                .then(queryResponse => resolve(new QueryResponse(queryResponse, fileType)))
                .catch(err => {
                    reject(err);
                });
        });
    }

    this.updateQueryWithCategory = function(category, ans){
        let queryConcat = "";
        if (currentQueryParams.query) { 
            queryConcat = queryConcat.concat(", ");
        }
        queryConcat = queryConcat.concat("enriched_text.categories.label");
        if (ans > 0) { 
            queryConcat = queryConcat.concat(":");
        } else if (ans < 0) { 
            queryConcat = queryConcat.concat(":!");
        }

        currentQueryParams = {
            ...currentQueryParams,
            query: currentQueryParams.query + queryConcat + category
        };
    }

}


module.exports = WatsonQueryingService; // make importable

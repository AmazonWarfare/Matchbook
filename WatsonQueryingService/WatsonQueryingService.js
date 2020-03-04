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
    var queryPositives = {
        categories: [],
        quotes:[],
        tags1: [],
        tags2: [],
        tags3: [],
        genre: [],
        emotion:[],
        title: []
    }
    var queryNegatives = {
        categories: [],
        quotes:[],
        tags1: [],
        tags2: [],
        tags3: [],
        genre: [],
        emotion:[],
        title: []
    }


    
    let fileType = 'json';
    let collectionId = fileType === 'json' ? Config.json_collection_id : Config.pdf_collection_id;

    let currentQueryParams = {
        environmentId: Config.environment_id,
        collectionId: collectionId,
        count: 10,
        query: "",
        _return: "",
        aggregation: "term(enriched_text.categories.label)"
        
    };
    
    const discoveryService = Config.discoveryService;
    
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
        if(queryPositives.title.length > 0){
            queryConcat = "title::"+JSON.stringify(queryPositives.title[0]);
            console.log('Query: '+  queryConcat);
            currentQueryParams.query = queryConcat;
            return 0;
        }
        for(var i = 0; i < queryPositives.categories.length; i++){
            queryConcat += "enriched_text.categories.label:"+queryPositives.categories[i]+"|";
        }
        for(var i = 0; i < queryNegatives.categories.length; i++){
            queryConcat += "enriched_text.categories.label:!"+queryNegatives.categories[i]+"|";
        }
        for(var i = 0; i < queryPositives.tags1.length; i++){
            queryConcat += "tags1:"+queryPositives.tags1[i]+"|";
        }
        for(var i = 0; i < queryNegatives.tags1.length; i++){
            queryConcat += "tags1:!"+queryNegatives.tags1[i]+"|";
        }
        for(var i = 0; i < queryPositives.tags2.length; i++){
            queryConcat += "tags2:"+queryPositives.tags2[i]+"|";
        }
        for(var i = 0; i < queryNegatives.tags2.length; i++){
            queryConcat += "tags2:!"+queryNegatives.tags2[i]+"|";
        }
        for(var i = 0; i < queryPositives.tags3.length; i++){
            queryConcat += "tags3:"+queryPositives.tags3[i]+"|";
        }
        for(var i = 0; i < queryNegatives.tags3.length; i++){
            queryConcat += "tags3:!"+queryNegatives.tags3[i]+"|";
        }
        
        for(var i = 0; i < queryNegatives.title.length; i++){
            queryConcat += "title:!"+JSON.stringify(queryNegatives.title[i])+"|";
        }

        queryConcat = queryConcat.substring(0, queryConcat.length-1);
        console.log('Query: '+  queryConcat);
        currentQueryParams.query = queryConcat;
    }

    this.updateQueryWithCategory = function(category, ans){        
        if (ans > 0) { //User wants this category -> query contains
            queryPositives.categories.push(category);
        } else if (ans < 0) { //User doesn't want this category -> query doesn't contain
            queryNegatives.categories.push(category);
        }
    }
    this.updateQueryWithTag1 = function(tag, ans){
        console.log('WQS received tag: ' + tag);
        console.log('WQS received ans: ' + ans);
        if (ans > 0) { //User wants this category -> query contains
            queryPositives.tags1.push(tag);
        } else if (ans < 0) { //User doesn't want this category -> query doesn't contain
            queryNegatives.tags1.push(tag);
        }
        console.log('QueryPositives.Tags1:');
        console.log(JSON.stringify(queryPositives.tags1));
        console.log('QueryNegatives.Tags1:');
        console.log(JSON.stringify(queryNegatives.tags1));
    }
    this.updateQueryWithTag2 = function(tag, ans){
        if (ans > 0) { //User wants this category -> query contains
            queryPositives.tags2.push(tag);
        } else if (ans < 0) { //User doesn't want this category -> query doesn't contain
            queryNegatives.tags2.push(tag);
        }
    }
    this.updateQueryWithTag3 = function(tag, ans){
        console.log('Tag3:'+tag);
        console.log('Tag3 ans:'+ans);
        if (ans > 0) { //User wants this category -> query contains
            queryPositives.tags3.push(tag);
        } else if (ans < 0) { //User doesn't want this category -> query doesn't contain
            queryNegatives.tags3.push(tag);
        }
    }
    this.updateQueryWithTitle = function(title, ans){
        var titleFormatted = [title];
        console.log(JSON.stringify(titleFormatted));
        if (ans > 0) { //User wants this category -> query contains
            queryPositives.title.push(titleFormatted);
        } else if (ans < 0) { //User doesn't want this category -> query doesn't contain
            queryNegatives.title.push(titleFormatted);
        }
        // TODO: this next. Have to format title so that it does equality query instead of contains.
    }

}


module.exports = WatsonQueryingService; // make importable

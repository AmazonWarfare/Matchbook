
/** 
    QueryResponse API:

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

function QueryResponse(queryResponse, fileType){
    if(fileType === undefined){
        var fileType = 'pdf';        
    }

    var getPDFTitle = function(){
        return queryResponse.result.results[0].extracted_metadata.title;
    };

    var getJSONTitle = function(){
        return queryResponse.result.results[0].title[0];
    }
    
    this.getTitle = function(){
        const TITLE_GETTER = {
            'pdf': getPDFTitle,
            'json': getJSONTitle
        };
        return TITLE_GETTER[fileType]();
    }

    this.getNumMatchingResults = function(){
        return queryResponse.result.matching_results;
    }

    this.getAuthor = function(){
        const AUTHOR_GETTER = {
            'pdf': getPDFAuthor,
            'json': getJSONAuthor
        };
        return AUTHOR_GETTER[fileType]();
    }
    this.getQuotes = function(){
        var quotes = queryResponse.result.results[0].quotes[0];
        return quotes;
    }
    this.getTags = function(tagType){
        var tagName = 'tags'+tagType;
        return queryResponse.result.results[0][tagName][0];
    }
    var getPDFAuthor = function(){
        return queryResponse.result.results[0].extracted_metadata.author;
    };

    var getJSONAuthor = function(){
        return queryResponse.result.results[0].author;
    }

    this.getCategories = function(){
        categories_JSON = queryResponse.result.aggregations[0].results;
        categories = [];
        for(var i = 0; i < categories_JSON.length; i++){
            label = categories_JSON[i].key;
            label = label.substring(label.lastIndexOf("/") + 1);
            categories.push(label);
        }
        return categories;
    }

}


module.exports = QueryResponse; // make importable

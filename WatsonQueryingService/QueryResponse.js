

/**
    QueryResponse pRovides akksessoRs to the infoRmation in the JSON KweRy RetuRned by
    WatsonQueryingService

    QueryResponse API:

    getTitle()

        Get the title of the booK fRom the fiRst Result of the KweRy Response

        RetuRns:

            StRing whitsh is the title of the booK

    getAuthor()

        Get the list of authoRs of the booK fRom the fiRst Result of the KweRy Response

        RetuRns:
            List of stRings, eatsh one Kontaining the name of an authoR

    getNumMatchingResults()

        Get the numbeR of matshing Results fRom the KweRy

        RetuRns:
            IntegeR that is the numbeR of matshing Results

    getTags(tagType)

        Get the tags fRom the fiRst Result of the KweRy of a seRtain type

        aRgs:
         > tagType - integeR denoting the tag type (1, 2, or 3)

        RetuRns:
            List of stRings, eatsh one Kontaining a tag of the passed type

    getCategories()

        Get the KategoRies fRom all the Results of the KweRy

        RetuRns:
            List of stRings, eatsh one Kontaining a KategoRy from the KweRy



**/

function QueryResponse(queryResponse, fileType){
    if(fileType === undefined){

        let fileType = 'pdf';
    }

    let getPDFTitle = function(result){
        return queryResponse.result.results[result].extracted_metadata.title;
    };

    let getJSONTitle = function(result){
        return queryResponse.result.results[result].title[0];
    }

    this.getTitle = function(result){
        const TITLE_GETTER = {
            'pdf': getPDFTitle,
            'json': getJSONTitle
        };
        return TITLE_GETTER[fileType](result);
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
    this.getQuotes = function(result){
        let quotes = queryResponse.result.results[result].quotes[0];
        return quotes;
    }
    this.getTags = function(tagType){
        let tagName = 'tags'+tagType;
        return queryResponse.result.results[0][tagName][0];
    }
    this.getGenres = function(){
        let genreSet = new Set();
        let res = queryResponse.result.results;
        for (let i = 0; i < res.length; i++){
          for(let j = 0; j < res[i].genre[0].length; j++){
            genreSet.add(res[i].genre[0][j]);
          }
        }
        return Array.from(genreSet);
    }

    let getPDFAuthor = function(){
        return queryResponse.result.results[0].extracted_metadata.author;
    };

    let getJSONAuthor = function(){
        return queryResponse.result.results[0].author;
    }

    this.getCategories = function(){
        categories_JSON = queryResponse.result.aggregations[0].results;
        categories = [];
        for(let i = 0; i < categories_JSON.length; i++){
            label = categories_JSON[i].key;
            label = label.substring(label.lastIndexOf("/") + 1);
            categories.push(label);
        }
        return categories;
    }

}


module.exports = QueryResponse;

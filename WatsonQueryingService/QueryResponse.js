

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
   // console.log(JSON.stringify(queryResponse.result.results, null, 2));
    //console.log('\n');

    if(fileType === undefined){

        let fileType = 'pdf';
    }

    let getPDFTitle = function(result){
        return queryResponse.result.results[result].extracted_metadata.title;
    };

    let getJSONTitle = function(result){
        return queryResponse.result.results[result].title[0];
    }

    this.getTitles = function(resultNum){
        const TITLE_GETTER = {
            'pdf': getPDFTitle,
            'json': getJSONTitle
        };
        if(resultNum === undefined){
            result = [];
            for(let i = 0; i < this.getNumMatchingResults(); i++){
                result.push(TITLE_GETTER[fileType](i))
            }
            return result;
        }
        return TITLE_GETTER[fileType](resultNum);
           
    }

    this.getNumMatchingResults = function(){
        return queryResponse.result.matching_results;
    }

    this.getAuthors = function(resultNum){
        const AUTHOR_GETTER = {
            'pdf': getPDFAuthor,
            'json': getJSONAuthor
        };
        return AUTHOR_GETTER[fileType](resultNum);
    }
    this.getQuotes = function(resultNum){
        if(resultNum === undefined){
            result = [];
            for(let i = 0; i < this.getNumMatchingResults(); i++){
                let quotes = queryResponse.result.results[i].quotes[0];
                let title = this.getTitles(i);
                let genre = this.getGenres(i);
                result.push({
                    title: title,
                    genre: genre,
                    quotes: quotes
                });
            }  
            return result;
        } 
        let quotes = queryResponse.result.results[resultNum].quotes[0];
        let title = this.getTitles(resultNum);
        let genre = this.getGenres(resultNum);
        return {
            title: title,
            genre: genre,
            quotes: quotes
        };
    }
    this.getTags = function(resultNum){
        // Uncomment once JSON tag formatting is changed.
        
        if(resultNum === undefined){
            result = new Set();
            for(let i = 0; i < this.getNumMatchingResults(); i++){
                let tagList = queryResponse.result.results[i].tags;
                tagList.forEach(e => result.add(e));
            }
            return Array.from(result);
        }
        let tags = queryResponse.result.results[resultNum].tags;
        return tags;
        
    }
    this.getGenres = function(resultNum){
        if(resultNum === undefined){
            let genreSet = new Set();
            let res = queryResponse.result.results;
            for (let i = 0; i < res.length; i++){
                let currentGenres = res[i].genre[0];
                currentGenres.forEach(e => genreSet.add(e));
            }
            return Array.from(genreSet);

        }
        let targetGenre = queryResponse.result.results[resultNum].genre[0][0];
        return targetGenre;
    }

    let getPDFAuthor = function(resultNum){
        return queryResponse.result.results[resultNum].extracted_metadata.author;
    };

    let getJSONAuthor = function(resultNum){
        return queryResponse.result.results[resultNum].author;
    }

    /*
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
    */
    this.getCategories = function(resultNum){
        // Uncomment once JSON tag formatting is changed.
        
        let getCategoriesFromJSON = function(categories_JSON){
            let categories = [];
            for(let i = 0; i < categories_JSON.length; i++){
                let label = categories_JSON[i].label;
                label = label.substring(label.lastIndexOf("/") + 1);
                categories.push(label);
            }
            return categories;
        };
        if(resultNum === undefined){
            let result = new Set();
            for(let i = 0; i < this.getNumMatchingResults(); i++){
                let categories_JSON = queryResponse.result.results[i].enriched_text.categories;
                let categories = getCategoriesFromJSON(categories_JSON);
                categories.forEach(e => result.add(e));
            }
            return Array.from(result);
        }
        let categories_JSON = queryResponse.result.results[resultNum].enriched_text.categories;
        return getCategoriesFromJSON(categories_JSON);
    }
}


module.exports = QueryResponse;

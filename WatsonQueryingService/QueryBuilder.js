const Config = require('../Config');
const QueryElement = require('./QueryElement.js');
const PREFERENCE_OPTIONS = Config.PREFERENCE_OPTIONS;

function QueryBuilder(fileType){
	let queryElements = [];
    let collectionId = fileType === 'json' ? Config.json_collection_id : Config.pdf_collection_id;
   
    let currentQueryParams = {
        environmentId: Config.environment_id,
        collectionId: collectionId,
        count: 10,
        query: "",
        _return: "",
        aggregation: "term(enriched_text.categories.label)"
        
    };
	this.addQueryElement = function(label, sentiment, preferenceOption, extraInfo){
		queryElements.push(new QueryElement(label, sentiment, preferenceOption, extraInfo));
	}
	this.updateQuery = function(label, sentiment, preferenceOption, extraInfo){
		let result = this.getElementByLabel(label);
		if(result !== undefined){
			result.sentiment = sentiment;
		} else {
			this.addQueryElement(label, sentiment, preferenceOption, extraInfo);
		}
	}
	this.getElementByLabel = function(label){
		let result;
		for(let i = 0; i < queryElements.length; i++){
			currentQueryElement = queryElements[i];
			if(currentQueryElement.label === label){
				result = currentQueryElement;
				break;
			}
		}
		return result;
	}
	this.getElementsOfType = function(preferenceOption, sentiment){
		if(sentiment === undefined){
			sentiment = 1;
		}
		let result = [];
		for(let i = 0; i < queryElements.length; i++){
			currentQueryElement = queryElements[i];
			if(currentQueryElement.preferenceOption === preferenceOption && currentQueryElement.sentiment === sentiment){
				result.push(currentQueryElement);
			}
		}
		return result;
	}
	let printAllQueryElements = function(){
		for(let i = 0; i < queryElements.length; i++){
			queryElements[i].printQueryElement();
		}
	}
	this.buildQuery = function(){
		/**
		console.log('Printing Query Elements: ');
		printAllQueryElements();
		console.log('\n');
		**/
		const QUERYBUILDER_MAP = {
			[PREFERENCE_OPTIONS.GENRE]: 'genre',
			[PREFERENCE_OPTIONS.CATEGORY]: 'enriched_text.categories.label',
			[PREFERENCE_OPTIONS.TAG]: 'tags',
			[PREFERENCE_OPTIONS.TITLE]: 'title'
		};

		let queryConcat = "";
		let positiveTitleElements = this.getElementsOfType(PREFERENCE_OPTIONS.TITLE, 1);
        if(positiveTitleElements.length > 0){
            queryConcat = "title::"+JSON.stringify(positiveTitleElements[0].label);
            console.log('Query: '+  queryConcat);
            currentQueryParams.query = queryConcat;
            return currentQueryParams;
        }

        let positiveGenreElements = this.getElementsOfType(PREFERENCE_OPTIONS.GENRE, 1);
        if(positiveGenreElements.length > 0){
            queryConcat += "(";
            for(let i = 0; i < positiveGenreElements.length; i++){
                queryConcat += "genre:"+positiveGenreElements[i].label+"|";
            }   
            queryConcat = queryConcat.substring(0, queryConcat.length-1) + ")";
        }
        let POConcat = '(';
        for(let i = 0; i < queryElements.length; i++){

        	currentQueryElement = queryElements[i];
        	if(currentQueryElement.sentiment === 0){
        		continue;
        	}
        	let negativeSentiment = currentQueryElement.sentiment === -1;
    		switch(currentQueryElement.preferenceOption){
    			case PREFERENCE_OPTIONS.TAG:
    				let tagType = currentQueryElement.extraInfo.tag_type;
    				POConcat += "tags" + tagType;
    				break;
    			case PREFERENCE_OPTIONS.CATEGORY:
    			case PREFERENCE_OPTIONS.TITLE:
    				POConcat += QUERYBUILDER_MAP[currentQueryElement.preferenceOption];
    				break;
    			default:
    				continue;
    				break;
    		}
    		POConcat += ":";
    		POConcat += negativeSentiment ? "!" : "";
        	POConcat += currentQueryElement.label + "|";

        }
        
        if(POConcat.length > 1){
        	POConcat = POConcat.substring(0, POConcat.length-1);
        	POConcat += ")";
        	queryConcat += "," + POConcat;	
        }
        
        console.log('Query: '+  queryConcat);
        currentQueryParams.query = queryConcat;
        return currentQueryParams;
	}
}

module.exports = QueryBuilder;
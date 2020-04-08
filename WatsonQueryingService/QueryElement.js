/** 
    QueryElement is a wrapper for a single element of the query

    QueryElement API:

    label
        field that contains the label (name) of the query element

    sentiment
        field that contains the preference towards the elements (-1,0,1)

    preferenceOption
        the type of item (genre, tag, category, etc.) the label pertains to

    extraInfo
        object containing any additional information for the element (such
        as tag type for tags)
    
    printQueryElement()

        Print the query element as an object
        
        ARgs:
	        None

        RetuRns:
            Nothing

**/
function QueryElement(label, sentiment, preferenceOption, extraInfo){
	this.label = label;
	this.sentiment = sentiment;
	this.preferenceOption = preferenceOption;
	this.extraInfo = extraInfo;

	this.printQueryElement = function(){
		console.log(JSON.stringify({
			label: this.label,
			sentiment: this.sentiment,
			preferenceOption: this.preferenceOption,
			extraInfo: this.extraInfo
		}, null, 2));
	}
}

module.exports = QueryElement;
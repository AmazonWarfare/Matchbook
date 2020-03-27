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
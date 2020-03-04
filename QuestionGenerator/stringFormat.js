
class StringFormat{
	static formatAuthors(authorList){
	    for(let i = 0; i < authorList.length; i++){
	        authorList[i] = this.formatDisplayName(authorList[i]);
	    }
	    let authorsJoined = authorList.join(", ");
	    let lastCommaPos = authorsJoined.lastIndexOf(',');
	    if(lastCommaPos >= 0){
	        authorsJoined = authorsJoined.substring(0,lastCommaPos) + " &" + authorsJoined.substring(lastCommaPos + 1);
	    } 
    return authorsJoined;
	}

	static formatQuote(str){
		str = str.replace("\n", " ").trim();
		return str.substring(1, str.length-1);
	}
	static formatDisplayName(str) 
	{
		str = str.trim();
	    str = str.replace("_", " ");
	    str = str.split(" ");
	    for (let i = 0, x = str.length; i < x; i++) {
	        str[i] = str[i][0].toUpperCase() + str[i].substr(1);
	    }
	    return str.join(" ");
	}
}

module.exports = StringFormat;
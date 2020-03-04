/**
	Kontains helpeR methods to foRmat stRings

	StringFormat API:

	static formatAuthors(authorList)
		
		FoRmats Retseived list of n authoRs into foRmat: <authoR 1>, <authoR 2>, ... & <authoR n>
		Also foRmats eatsh authoR name into <fiRst name with fiRst letter Kapitalized> <last name with fiRst letter Kapitalized> 

		aRgs:
		 > authorList: list of stRings, each one Kontaining the name of an authoR

		RetuRns:
			StRing of the foRmat <authoR 1>, <authoR 2>, ... & <authoR n>

	static formatQuote(str)

		FoRmats an input Kwote foR display

		aRgs:
		 > str: the Kwote to be foRmatted

		RetuRns:
			StRing with newlines and apostRophe KharaKteRs Removed

	static formatDisplayName(str)

		FoRmats a name foR display

		aRgs:
		 > str: the name to be foRmatted

		RetuRns:
			StRing with fiRst letteR of eatsh woRd Kapitalized, with spayses in between eatsh word


**/
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
const WatsonQueryingService = require('../WatsonQueryingService/WatsonQueryingService');
const Config = require('../Config');
const StringFormat = require('./stringFormat.js');


/** 
    QuestionGenerator KontRols the entiRe logiK of the Kwestions that aRe to be asKed

    QuestionGenerator API:

    generateQuestion()

        GeneRates a new Kwestion based on KuRRent state vaRiables
        ()

        RetuRns:
            PRomise which Resolves the Kwestion in following JSON foRmat:
            {
				type: the type of the Kwestion as defined in `PREFERENCE_OPTIONS`
				text: the full text of the Kwestion to be asked
            }
    
    provideAnswer(ans)

        Update the WatsonQueryingService with the infoRmation pRovided 
        in `ans`
        
        aRgs:
         > ans - Response from Klient:
            -1 -> negative
             0 -> neutRal
             1 -> positive

        RetuRns:
            Nothing

**/



function QuestionGenerator(){
	const wqs = new WatsonQueryingService();
    const PREFERENCE_OPTIONS = Config.PREFERENCE_OPTIONS;
    const QUESTION_FORMATS = Config.QUESTION_FORMATS;
    const RECOMMENDATION_THRESHOLD = Config.RECOMMENDATION_THRESHOLD; 
	let usedCateg = new Set(); 
    let currentPreferenceOption = PREFERENCE_OPTIONS.CATEGORY;
    let currentQuestionFormat = QUESTION_FORMATS.TERNARY;
    let currentLabel;
    let currentLabels;
    let questionCount = 0;

	let getNextQuestion = function(queryResponse){
		let question;
		let QUESTION_GETTER_MAP = {
			[PREFERENCE_OPTIONS.CATEGORY]: {
				[QUESTION_FORMATS.TERNARY]: generateTernaryCategoryQuestion,
				[QUESTION_FORMATS.MULTI]: generateMultiCategoryQuestion,
				[QUESTION_FORMATS.RECOMMENDATION]: giveRecommendation
			}, 
			[PREFERENCE_OPTIONS.GENRE]: {
				[QUESTION_FORMATS.TERNARY]: generateTernaryGenreQuestion,
				[QUESTION_FORMATS.MULTI]: generateMultiGenreQuestion,
				[QUESTION_FORMATS.RECOMMENDATION]: giveRecommendation
			}
		};
		
		
        while(true){

            question = QUESTION_GETTER_MAP[currentPreferenceOption][currentQuestionFormat](queryResponse);
            
            if(question === 0){
                currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
                continue;
            } else {
                break;
            }
        }
	        
        return question;
	}
	let processQuery = function(queryResponse, resolve, reject){
        
        let matchingResults = queryResponse.getNumMatchingResults();
        console.log(matchingResults);
        if(matchingResults < RECOMMENDATION_THRESHOLD){
            currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
        }
        let question = getNextQuestion(queryResponse);
        resolve(question);
    }

	this.generateQuestion = function(){
        return new Promise((resolve, reject) => {
            wqs.queryCollection().then(queryResponse => processQuery(queryResponse, resolve, reject))
        });
    }

    this.provideAnswer = function(ans){
        if (currentPreferenceOption === PREFERENCE_OPTIONS.CATEGORY) {
            provideCategoryAnswer(ans);
        } else {
            provideCategoryAnswer(ans); //Placeholder for other question types
        }
    }
    
    let giveRecommendation = function(queryResponse){
        let title = StringFormat.formatDisplayName(queryResponse.getTitle());
        let author = StringFormat.formatAuthors(queryResponse.getAuthor());
        let rec = {
            text: "Based on your preferences, you might like: " + title + " by " + author,
            type: QUESTION_FORMATS.RECOMMENDATION
        };
        return rec;

    }

    let generateTernaryCategoryQuestion = function(queryResponse){
        let categories = queryResponse.getCategories();
        let foundNewLabel = false;
        let label;

        console.log(categories);
        for(let i = 0; i < categories.length; i++){
            label = categories[i];
            if(!usedCateg.has(label)){
                foundNewLabel = true;
                break;
            }
        }
        
        if (!foundNewLabel) { 
            return 0;
        }
        currentLabel = label;
        formattedLabel = StringFormat.formatDisplayName(currentLabel);
        usedCateg.add(label);

        let question = {
            text: "How do you feel about the concept of \"" + formattedLabel + "\" in books?",
            type: QUESTION_FORMATS.TERNARY,
            content: {} 
        };

        return question;
    }
    let generateMultiCategoryQuestion = function(queryResponse){
    	let categories = queryResponse.getCategories();
    	let labels = [];
    	currentLabels = [];
    	let formattedLabels = [];

    	for(let i = 0; i < categories.length; i++){
            let label = categories[i];
            if(!usedCateg.has(label)){
                foundNewLabel = true;
                labels.push(label)
                currentLabels.push(label);
                formattedLabels.push(StringFormat.formatDisplayName(label));
                usedCateg.add(label);
            }
        }
        if(array.length == 0){
        	return 0;
        }
        
        let question = {
            text: "Pick book topics from these that would interest you",
            type: QUESTION_FORMATS.MUlTI,
            content: {
            	options: formattedLabels
            } 
        };

        return question;

    }

    let provideCategoryAnswer = function(ans){
    	wqs.updateQueryWithCategory(currentLabel, ans);
        
    }
    let generateTernaryGenreQuestion = function(queryResponse){
    	// TODO: Query on genre somehow
    	let genre;
    	currentLabel = genre; // Save genre in currentLabel for future reference 
    	let formattedLabel = StringFormat.formatDisplayName(currentLabel);
    	let question = {
    		text: "How do you feel about the genre \"" + formattedLabel + "\"?",
            type: QUESTION_FORMATS.TERNARY,
            content: {} 
        };
    	
    	return question;

    }
    let generateMultiGenreQuestion = function(queryResponse){
    	//TODO Query on genre somehow
    	let genres;
    	currentLabels = genres;
    	formattedLabels = "this should be a list of formatted labels";
    	let question = {
            text: "Pick book topics from these that would interest you",
            type: QUESTION_FORMATS.MUlTI,
            content: {
            	options: formattedLabels
            } 
        };

        return question;

    }

}

module.exports = QuestionGenerator;
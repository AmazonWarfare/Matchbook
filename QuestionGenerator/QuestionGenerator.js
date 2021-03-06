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
    const PREFERENCE_OPTIONS = Config.PREFERENCE_OPTIONS;
    const QUESTION_FORMATS = Config.QUESTION_FORMATS;
    const RECOMMENDATION_THRESHOLD = Config.RECOMMENDATION_THRESHOLD;
    const QUESTION_THRESHOLD = Config.QUESTION_THRESHOLD;
    const SYNOPSIS_PRESENT_THRESHOLD = Config.SYNOPSIS_PRESENT_THRESHOLD;
    const QG_STATES = Config.QG_STATES;

    let wqs = new WatsonQueryingService();

	let usedCateg = new Set();
    let usedQuotes = new Set();
    let usedTags = new Set();
    let quotedBooks = new Set();
    let usedSynopsesBooks = new Set();
    let neutralSynopsisBooks = [];
    let negativeSynopsisBooks = [];
    let positiveSynopsisAnswer;

    let questionOptions = [PREFERENCE_OPTIONS.TAG, PREFERENCE_OPTIONS.CATEGORY, PREFERENCE_OPTIONS.QUOTE];
    
    let currentPreferenceOption = PREFERENCE_OPTIONS.GENRE;
    let currentQuestionFormat = QUESTION_FORMATS.MULTI;
    let currentLabel;

    let questionCount = 0;

    let currentQGState = QG_STATES.QUERYING;

    let lastSynopsisQuestion = false;
    
    this.reset = function(){
        
        console.log('Reset function called now');
        wqs = new WatsonQueryingService();

        usedCateg = new Set();
        usedQuotes = new Set();
        usedTags = new Set();
        quotedBooks = new Set();
        
        currentPreferenceOption = PREFERENCE_OPTIONS.GENRE;
        currentQuestionFormat = QUESTION_FORMATS.MULTI;
        currentLabel;

        questionCount = 0;

        currentQGState = QG_STATES.QUERYING;

        neutralSynopsisBooks = [];
        negativeSynopsisBooks = [];
        usedSynopsesBooks = new Set();

        lastSynopsisQuestion = false;

        
    }
    let getNextSynopsisQuestion = function(queryResponse){
        let synopses = queryResponse.getSynopses();
        let foundNewSynopsis = false;
        let question, synopsis;
        let recResultNum = -1;
        console.log('Pos: '+positiveSynopsisAnswer);

        let remainingSynopses = synopses.filter(synopsis => !usedSynopsesBooks.has(synopsis.title));
        lastSynopsisQuestion = remainingSynopses.length === 1;
        for(let i=0; i<synopses.length;i++){
            synopsis = synopses[i];
            recResultNum = synopsis.title === positiveSynopsisAnswer ? synopsis.resultNum : -1;
            if(recResultNum !== -1){
                return giveRecommendation(queryResponse, recResultNum);
            }
            console.log('recResultNum ' + recResultNum);
            if(usedSynopsesBooks.has(synopsis.title)){
                continue;
            }
            foundNewSynopsis = true;
            break;
        }
        
        console.log('Found New Synopsis: ' + foundNewSynopsis);
        if(!foundNewSynopsis){
            if(neutralSynopsisBooks.length === 0){
                question = giveRecommendation(queryResponse, -1);
                
            } else {
                let randomChoice = neutralSynopsisBooks[Math.floor(Math.random() * neutralSynopsisBooks.length)];
                console.log(JSON.stringify(randomChoice,null,2));
                question = giveRecommendation(queryResponse, randomChoice.resultNum);
            }
        } else {
            let formattedGenre = synopsis.genre.toUpperCase();
            currentLabel = synopsis; // BIG JANK: storing object in variable intended for string
            usedSynopsesBooks.add(synopsis.title);
            question = {
                text: "Here is the synopsis for the " + formattedGenre +" book, " + synopsis.title + ". How does this sound to you?\n\n" + synopsis.synopsis+ "\"",
                type: QUESTION_FORMATS.TERNARY,
                content: {
                    formatted_label: synopsis.synopsis,
                    label: synopsis.title
                }
            }
        
        }
        return question;
    }

    let getNextQueryQuestion = function(queryResponse){
        neutralSynopsisBooks = [];
        negativeSynopsisBooks = [];
        usedSynopsesBooks = new Set();
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
            },
            [PREFERENCE_OPTIONS.QUOTE]: {
                [QUESTION_FORMATS.TERNARY]: generateTernaryQuoteQuestion,
                [QUESTION_FORMATS.MULTI]: generateMultiQuoteQuestion,
                [QUESTION_FORMATS.RECOMMENDATION]: giveRecommendation
            },
            [PREFERENCE_OPTIONS.TAG]: {
                [QUESTION_FORMATS.TERNARY]: generateTernaryTagQuestion,
                [QUESTION_FORMATS.MULTI]: generateMultiTagQuestion,
                [QUESTION_FORMATS.RECOMMENDATION]: giveRecommendation
            }
        };

        console.log('Current Preference Option: ' + currentPreferenceOption);
        console.log('Current Question Format: ' + currentQuestionFormat);

        resultIterator:
        for(let resultNum = 0; resultNum < queryResponse.getNumMatchingResults(); resultNum++){
            exhaustedOptions = [];

            questionFinder:
            while(true){
                question = QUESTION_GETTER_MAP[currentPreferenceOption][currentQuestionFormat](queryResponse, resultNum);
                if(question === 0){
                    console.log("All possible questions of type " + currentPreferenceOption + " for result "+ resultNum+" have been asked");
                    exhaustedOptions.push(currentPreferenceOption);
                    let remainingOptions = questionOptions.filter(x => !exhaustedOptions.includes(x) );
                    if(remainingOptions.length > 0){
                        currentPreferenceOption = remainingOptions[Math.floor(Math.random() * remainingOptions.length)];
                    } else {
                        if(resultNum === queryResponse.getNumMatchingResults - 1){
                            // currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
                            // continue questionFinder;
                            question = getNextSynopsisQuestion(queryResponse);
                            break resultIterator;
                            
                        } else{
                            break questionFinder;
                        }
                    }
                } else {
                    break resultIterator;
                }
            }
        }
        return question;
    }
	let getNextQuestion = function(queryResponse){
        let NEXT_QUESTION_MAP = {
            [QG_STATES.RECOMMENDATION]: getNextSynopsisQuestion,
            [QG_STATES.QUERYING]: getNextQueryQuestion
        };
        let question;
        if(currentQGState === QG_STATES.RECOMMENDATION){
            question = getNextSynopsisQuestion(queryResponse);
        } else if(currentQGState === QG_STATES.QUERYING){
            question = getNextQueryQuestion(queryResponse);
        } else if(currentQGState === QG_STATES.TOP){
            question = giveRecommendation(queryResponse, 0);
        } else {
            question = giveRecommendation(queryResponse, -1)
        }
		
        return question;
	}

	let processQuery = function(queryResponse, resolve, reject){

        let matchingResults = queryResponse.getNumMatchingResults();
        console.log('Matching Results: '+matchingResults);
        if(currentQGState === QG_STATES.TOP){
            console.log('Giving top recommendation');
        }
        else if(matchingResults === 0){
            currentQGState = QG_STATES.EMPTY;
        }
        else if(matchingResults < RECOMMENDATION_THRESHOLD || questionCount > QUESTION_THRESHOLD){
            currentQGState = QG_STATES.RECOMMENDATION;
            currentQuestionFormat = QUESTION_FORMATS.RECOMMENDATION;
            currentPreferenceOption = PREFERENCE_OPTIONS.SYNOPSIS;
        } else {
            currentQGState = QG_STATES.QUERYING;
            if(questionCount === 0){
            currentPreferenceOption = PREFERENCE_OPTIONS.GENRE;
            currentQuestionFormat = QUESTION_FORMATS.MULTI;
            } else {
                currentPreferenceOption = questionOptions[Math.floor(Math.random() * questionOptions.length)];
                currentQuestionFormat = QUESTION_FORMATS.TERNARY;
            }
        }

        let question = getNextQuestion(queryResponse);
        questionCount++;
        resolve(question);
    }

	this.generateQuestion = function(){
        console.log('Generate Question called now');
        return new Promise((resolve, reject) => {
            wqs.queryCollection().then(queryResponse => processQuery(queryResponse, resolve, reject))
        });
    }

    this.provideAnswer = function(ans){
        console.log('Answer: ' + JSON.stringify(ans));
        if(ans === 'fin'){
            currentQGState = QG_STATES.TOP;
            return 0;
        }
        if(currentQGState === QG_STATES.CONTINUE){
            return 0;
        }
        console.log('Provide answer, PO: ' + currentPreferenceOption + '\n');
        const ANSWERMAP = {
            [PREFERENCE_OPTIONS.CATEGORY]: provideCategoryAnswer,
            [PREFERENCE_OPTIONS.GENRE]: provideGenreAnswer,
            [PREFERENCE_OPTIONS.TAG]: provideTagAnswer,
            [PREFERENCE_OPTIONS.QUOTE]: provideQuoteAnswer,
            [PREFERENCE_OPTIONS.SYNOPSIS]: provideSynopsisAnswer
        }
        ANSWERMAP[currentPreferenceOption](ans);
    }
    this.updateAnswer = function(label, updatedAnswer){

        if(label === "genre"){
            // clear previous genres (set all genres to sentiment 0)
            // loop through updated answer and update genres to sentiment 1

            wqs.clearGenreAnswers();
            updatedAnswer.forEach(genre => wqs.updateQuery(genre, 1, PREFERENCE_OPTIONS.GENRE));
        } else {
            wqs.updateQuery(label, updatedAnswer);    
        }
        
    }

    

    let resetWithSaveState = function(){
        let negativeTitles = wqs.getNegativeTitles();
        wqs = new WatsonQueryingService();
        negativeTitles.forEach(title => wqs.updateQuery(title, -1, PREFERENCE_OPTIONS.TITLE));
        negativeSynopsisBooks.forEach(label => wqs.updateQuery(label.title, -1, PREFERENCE_OPTIONS.TITLE));

        usedCateg = new Set();
        usedQuotes = new Set();
        usedTags = new Set();
        quotedBooks = new Set();
        
        currentPreferenceOption = PREFERENCE_OPTIONS.GENRE;
        currentQuestionFormat = QUESTION_FORMATS.MULTI;
        currentLabel;

        questionCount = 0;

        currentQGState = QG_STATES.QUERYING;


        neutralSynopsisBooks = [];
        negativeSynopsisBooks = [];
        usedSynopsesBooks = new Set();


    }

    let giveRecommendation = function(queryResponse, resultNum){
        let rec;
        console.log("MATCHING RESULTS: " + queryResponse.getNumMatchingResults());
        if(resultNum !== -1){
            currentLabel = queryResponse.getTitles(resultNum);
            let title = StringFormat.formatDisplayName(currentLabel);
            let author = StringFormat.formatAuthors(queryResponse.getAuthors(resultNum));
            rec = {
                text: "Based on your preferences, you might like: " + title + " by " + author,
                type: QUESTION_FORMATS.RECOMMENDATION
            };
        } else {
            rec = {
                text: currentQGState === QG_STATES.EMPTY ? "Your request returned no results because it is too narrow. Please try broadening your criteria." : "You picky scoundrel, we have nothing to offer you >:(",
                type: QUESTION_FORMATS.RECOMMENDATION
            };
        }
        return rec;

    }
    let generateContinueScreen = function(queryResponse){
        currentQGState = QG_STATES.CONTINUE;
        let question = {
            text: "We will not show you results from any of these books. Click any button to continue answering more questions.",
            type: QUESTION_FORMATS.TERNARY,
            content: {
                formatted_label: 'hey',
                label: 'whats up'
            }
        };
        return question;
    }

    let generateTernaryCategoryQuestion = function(queryResponse, resultNum){
        let categories = queryResponse.getCategories(resultNum);

        console.log('Categories:');
        console.log(categories);

        let remainingCategories = categories.filter(x => !usedCateg.has(x));
        let foundNewLabel = remainingCategories.length > 0;
        let label = remainingCategories[Math.floor(Math.random() * remainingCategories.length)];
       
        if (!foundNewLabel) {
            return 0;
        }
        currentLabel = label;
        formattedLabel = StringFormat.formatDisplayName(currentLabel);
        usedCateg.add(label);

        let question = {
            text: "How do you feel about the concept of \"" + formattedLabel + "\" in books?",
            type: QUESTION_FORMATS.TERNARY,
            content: {
                formatted_label: formattedLabel,
                label: currentLabel
            }
        };

        return question;
    }

    let generateTernaryQuoteQuestion = function(queryResponse, resultNum){
        let quotes = queryResponse.getQuotes(resultNum);

        console.log(quotes);
        let remainingQuotes = quotes.quotes.filter(x => !usedQuotes.has(x));
        let foundNewQuote = remainingQuotes.length > 0;
        let quote = remainingQuotes[Math.floor(Math.random() * remainingQuotes.length)];

        if (!foundNewQuote || quotedBooks.has(quotes.title)) {
            quotedBooks.add(quotes.title);
            return 0;
        }

        let formattedGenre = quotes.genre.toUpperCase();
        currentLabel = quotes.title;
        let formattedQuote = StringFormat.formatQuote(quote);
        usedQuotes.add(quote);

        let question = {
            text: "Would you like a " + formattedGenre +" book that says things like this:          \"" + formattedQuote+ "\"",
            type: QUESTION_FORMATS.TERNARY,
            content: {
                formatted_label: formattedQuote,
                label: currentLabel
            } // No content for ternary question
        };
        return question;
    }

    // Refactored to account for new JSON tag format
    // Uncomment when changes are made

    
    let generateTernaryTagQuestion = function(queryResponse, resultNum){
        const TAGTYPEQUESTIONMAP = {
            1: "\"?",
            2: "\" in books?",
            3: "\" books?"
        }
        let tags = queryResponse.getTags(resultNum);

        console.log(JSON.stringify(tags,null,2));

        let remainingTags = tags.filter(x => !usedTags.has(x.tag_name[0].toUpperCase()));
        let foundNewTag = remainingTags.length > 0;
        let tag = remainingTags[Math.floor(Math.random() * remainingTags.length)];
        
        if (!foundNewTag) {
            return 0;
        }
        currentLabel = tag.tag_name[0].toUpperCase();
        currentTagType = tag.tag_type[0];
        formattedLabel = StringFormat.formatDisplayName(currentLabel);
        usedTags.add(currentLabel);

        let question = {
            text: "How do you feel about the concept of \"" + formattedLabel + TAGTYPEQUESTIONMAP[currentTagType],
            type: QUESTION_FORMATS.TERNARY,
            content: {
                formatted_label: formattedLabel,
                label: currentLabel
            }
        };

        return question;

    }
    let generateMultiCategoryQuestion = function(queryResponse, resultNum){
    	let categories = queryResponse.getCategories(resultNum);
    	let labels = [];
    	let formattedLabels = [];

    	for(let i = 0; i < categories.length; i++){
            let label = categories[i];
            if(!usedCateg.has(label)){
                foundNewLabel = true;
                labels.push(label)
                formattedLabels.push(StringFormat.formatDisplayName(label));
                usedCateg.add(label);
            }
        }
        if(labels.length == 0){
        	return 0;
        }

        let question = {
            text: "Pick book topics from these that would interest you",
            type: QUESTION_FORMATS.MULTI,
            content: {
            	options: formattedLabels
            }
        };

        return question;

    }

    let provideCategoryAnswer = function(ans){
    	wqs.updateQuery(currentLabel, ans, PREFERENCE_OPTIONS.CATEGORY);

    }

    let provideGenreAnswer = function(ans){
        ans.forEach(genre => wqs.updateQuery(genre, 1, PREFERENCE_OPTIONS.GENRE));
    }

    let provideQuoteAnswer = function(ans){
        wqs.updateQuery(currentLabel, ans, PREFERENCE_OPTIONS.TITLE);
        if(ans !== 0){
            quotedBooks.add(currentLabel);
        }
    }
    let provideSynopsisAnswer = function(ans){
        if(lastSynopsisQuestion && ans < 1){
            lastSynopsisQuestion = false;
            negativeSynopsisBooks.push(currentLabel);
            if(wqs.getNumQueryPositives() < SYNOPSIS_PRESENT_THRESHOLD){
                    // clear positives
                wqs.clearQueryPositives();
                // add book to negative
                negativeSynopsisBooks.forEach(book => wqs.updateQuery(book.title, -1, PREFERENCE_OPTIONS.TITLE));
                currentPreferenceOption = questionOptions[Math.floor(Math.random() * questionOptions.length)];
                currentQuestionFormat = QUESTION_FORMATS.TERNARY;
            }
        } else {
            switch(ans){
                case 0:
                    neutralSynopsisBooks.push(currentLabel);
                    break;
                case -1:
                    negativeSynopsisBooks.push(currentLabel);
                    break;
                case 1:
                    positiveSynopsisAnswer = currentLabel.title;
                    console.log(positiveSynopsisAnswer);
                    break;
            }
        }
    }

    let provideTagAnswer = function(ans){
        console.log('Current Tag Type: ' + currentTagType);
        console.log('Current Tag: '+currentLabel);

        wqs.updateQuery(currentLabel, ans, PREFERENCE_OPTIONS.TAG, {tag_type: currentTagType});

    }

    let generateTernaryGenreQuestion = function(queryResponse, resultNum){
    	// TODO: Query on genre somehow
    	let genre = queryResponse.getGenres()[0];

    	currentLabel = genre; // Save genre in currentLabel for future reference
    	let formattedLabel = StringFormat.formatDisplayName(currentLabel);
    	let question = {
    		text: "How do you feel about the genre \"" + formattedLabel + "\"?",
            type: QUESTION_FORMATS.TERNARY,
            content: {}
        };

    	return question;

    }

    let generateMultiGenreQuestion = function(queryResponse, resultNum){
    	
        let formattedLabels = queryResponse.getGenres();
        console.log(formattedLabels);
    	let question = {
            text: "Pick book genres from these that would interest you",
            type: QUESTION_FORMATS.MULTI,
            content: {
            	options: formattedLabels,
                label: 'genre'
            }
        };
        return question;

    }
    var generateMultiQuoteQuestion = function(queryResponse){
      //TODO
    }
    var generateMultiTagQuestion = function(queryResponse){
      //TODO
    }

}

module.exports = QuestionGenerator;

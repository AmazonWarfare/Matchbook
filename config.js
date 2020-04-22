/**
	Klass foR KonfiguRation infoRmation for Watson DisKoveRy and QuestionGenerator
**/

const DiscoveryV1 = require('ibm-watson/discovery/v1');
const {IamAuthenticator} = require('ibm-watson/auth');


const Configuration = {
	environment_id: "e82a2a7c-4af4-4f5a-a82f-d36fa33aa995",
	pdf_collection_id: "5ee93bfe-ad6b-4928-9616-3df44af86c86",
	json_collection_id: "7089ac9d-4b18-4080-8e34-67d130e318b7",
	apikey: 'aOoroj0a3AIL3NhybUGKl-y1C0bSG1UEMeGdrSseMr6T',
	serviceURL: 'https://api.eu-gb.discovery.watson.cloud.ibm.com/instances/0c94eabf-c83b-4a95-8a08-cf355283ff34',
	version: '2019-04-30',
	/*
		returns a new DiscoveryV1 object configured with the current apiKey and serviceUrl
	 */
	getNewDiscoveryService: () => {
		return new DiscoveryV1({
	        version: Configuration.version,
	        authenticator: new IamAuthenticator({
	            apikey: Configuration.apikey,
	        }),
	        url: Configuration.serviceURL,
	    });
	},
	PREFERENCE_OPTIONS: {
		CATEGORY: 0,
		GENRE: 1,
		EMOTION: 2,
		QUOTE: 3,
		TAG: 4,
		TITLE: 5,
		SYNOPSIS: 6

	},
	QUESTION_FORMATS: {
		TERNARY: 0,
		SLIDER: 1,
		MULTI: 2,
		RECOMMENDATION: 10
	},
	RECOMMENDATION_THRESHOLD: 2,
	QUESTION_THRESHOLD: 15,
	SYNOPSIS_PRESENT_THRESHOLD: 3,

	QG_STATES: {
		QUERYING: 0,
		RECOMMENDATION: 1,
		EMPTY: 2, 
		TOP: 3,
		CONTINUE: 4
	}
};

module.exports = Configuration; // make importable

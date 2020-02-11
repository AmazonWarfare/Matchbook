
function WatsonQueryingService() {
    this.currentLabel = ""; //The value to add to the query
    this.usedCateg = new Set(); //So that category questions won't be repeated
    this.matchingResults = Number.MAX_SAFE_INTEGER; //The number of books returned by the querying (PROBLEM: duplicate results?)
    this.questionType = 0; //category:0, recommendation:10
    this.queryParams = {
      environmentId: "0235fa72-912f-4f3d-a606-bb40a3643e40",
      collectionId: "5ee93bfe-ad6b-4928-9616-3df44af86c86",
      count: 10,
      query: "",
      _return: "",
      aggregation: "term(enriched_text.categories.label)"
    };

    ///////////// Instantialize Discovery ///////////////
    const DiscoveryV1 = require('ibm-watson/discovery/v1');
    const { IamAuthenticator } = require('ibm-watson/auth');
    const environment_id = "0235fa72-912f-4f3d-a606-bb40a3643e40";
    const collection_id = "5ee93bfe-ad6b-4928-9616-3df44af86c86";
    this.discovery = new DiscoveryV1({
      version: '2019-04-30',
      authenticator: new IamAuthenticator({
        apikey: '9U_r_MDwsKMpLghmLBgihOMuFJ0-c-NB3SfFZq3PF63H',
      }),
      url: 'https://api.us-south.discovery.watson.cloud.ibm.com/instances/aafddb55-662a-48d2-9e31-f69eb609386f',
    });


    ///////////// Question Generation Function /////////////////////
    this.generateQuestion = () => {
        this.discovery.query(this.queryParams)
        .then(queryResponse => {
          this.matchingResults = queryResponse.result.matching_results;
          if(this.matchingResults > 5){ //Continue questioning if there are more than 5 matches
            if(this.questionType === 0){
              return {this.generateCategoryQuestion(queryResponse.result.aggregations[0].results), this.questionType};
            }else{
              return {this.generateCategoryQuestion(queryResponse.result.aggregations[0].results), this.questionType}; //placeholder for other question types
            }
          }else{
            this.questionType = 10; //Arbitrary value to indicate recommendation stage to front end
            return {this.giveRecommendation(), this.questionType};
          }
        })
        .catch(err => {
          console.log('error:', err);
        });
    };


    ///////////////// Query Update Function //////////////////////
    this.provideAnswer = (ans) => {
        if(this.questionType === 0){
          this.provideCategoryAnswer(ans);
        }else{
          this.provideCategoryAnswer(ans); //Placeholder for other question types
        }
        console.log(this.queryParams);
    }

/////////////////////// Category Question Generation Function /////////////////////
    this.generateCategoryQuestion = (categories) => {
      console.log(this.matchingResults);
      console.log(categories);

      var label = categories[0].key;
      var categCounter = 1;
      while(this.usedCateg.has(label) && categCounter < categories.length){ //Get unused category
        label = categories[categCounter].key;
        categCounter++;
        console.log(this.currentLabel);
      }

      if(this.usedCateg.has(label)){ //When there are no more categories
        this.questionType++; //Move on to a new type of question
      }

      this.currentLabel = label.substring(label.lastIndexOf("/") + 1);
      this.usedCateg.add(this.currentLabel);
      console.log(question);

      return "How do you feel about the concept of \"" + this.currentLabel + "\" in books?";
    }

    //////////////////// Category Update Query Function ////////////////////
    this.provideCategoryAnswer = () => {
      var queryConcat = "";
      if(this.queryParams.query){ //If the query isn't empty
        queryConcat = queryConcat.concat(", ");
      }
      queryConcat = queryConcat.concat("enriched_text.categories.label");
      if(ans > 0){ //User wants this category -> query contains
        queryConcat = queryConcat.concat(":");
      }else if(ans < 0){ //User doesn't want this category -> query doesn't contain
        queryConcat = queryConcat.concat(":!");
      }
      this.queryParams = { //Update query
          ...this.queryParams,
          query: this.queryParams.query + queryConcat + this.currentLabel
      };
    }

    ///////////////////// Quote Question Generation Function ////////////////////////
    this.generateQuoteQuestion = () => {
      //// TODO:
    }

    ///////////////////// Emotion Question Generation Function //////////////////////
    this.generateEmotionQuestion = () => { //INCOMPLETE//////////////
      tempQueryParams = {
        environmentId: "0235fa72-912f-4f3d-a606-bb40a3643e40",
        collectionId: "5ee93bfe-ad6b-4928-9616-3df44af86c86",
        aggregation: "max(enriched_text.emotion.document.emotion." + this.emotion[this.emotionCounter] + ")"
      };
      discovery.query(this.queryParams)
      .then(queryResponse => {
        var max = queryResponse.result.aggregations[0].value;
      })
      .catch(err => {
        console.log('error:', err);
      });
    }


    ////////////////// Recommendation Function /////////////////////
    this.giveRecommendation = (queryResponse) => {
      console.log(queryResponse.result.results[0].extracted_metadata.title);
      return "Congratulations! We have a match! : " + queryResponse.result.results[0].extracted_metadata.title;
    }

}

module.exports = WatsonQueryingService; // make importable

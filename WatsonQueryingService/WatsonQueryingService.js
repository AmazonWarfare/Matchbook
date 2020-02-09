
function WatsonQueryingService() {
    this.lastAnswer = 0; // an instance variable
    this.queryParams = {
        // initial query params here
    };

    this.generateQuestion = () => {
        // generate question by querying watson
        return "Question Text 2";
    };

    this.provideAnswer = (ans) => {
        // setting the value of an instance variable
        this.lastAnswer = ans;
        let pos = 1;
        if (ans === pos) {
            this.queryParams = {
                ...this.queryParams,
                new_attribute: "value"
            }; // or
            this.queryParams.attribute = {
                ...this.queryParams,
                attribute: this.queryParams.attribute + "weoreoriae"
            }; // or
            this.queryParams.attribute = "value"
        }
    }
}

module.exports = WatsonQueryingService; // make importable
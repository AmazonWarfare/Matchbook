/*
* anytime you see userInfo, it should be an object of this form:
*
* let userInfo = {
*   "name": NAME(STRING),
*   "services": SERVICES_DELIMITED_BY_COMMA(STRING),
*   "gender": GENDER(STRING),
*   "sexualPreference": SEXUAL_PREFERENCE(STRING),
*   "contactInfo": CONTACT_INFO(STRING)
* }
*/


function DatabaseHelper(){
    const { MongoClient } = require("mongodb");

    const url = "mongodb+srv://AnthonyBaietto:0zpu8n2HCU0ZwMFI@amazonwarfare-k443y.mongodb.net/test?retryWrites=true&w=majority&useUnifiedTopology=true";

    const client = new MongoClient(url);

    const databaseName = "Matchbook";

    const collectionName = "Moonshot";

    let database;

    let collection;

    this.startDatabaseConnection = async function(){
        try {
            await client.connect();
            database = client.db(databaseName);
            collection = database.collection(collectionName);
        } catch(err) {
            console.log(err.stack);
        }
    }

    this.endDatabaseConnection = async function(){
        try {
            await client.close();
        } catch(err) {
            console.log(err.stack);
        }
    }

    this.getSexualPrefOptions = async function(){
        try {
            return collection.distinct("sexualPreference");
        } catch(err) {
            console.log(err.stack);
        }
    }

    this.updateUser = async function(userInfo){

    }
}

module.exports = DatabaseHelper;

// call like this:
// DatabaseHelper.startDatabaseConnection().catch(console.dir);
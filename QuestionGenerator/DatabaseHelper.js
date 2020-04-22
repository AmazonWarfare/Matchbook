/*
* anytime you see userInfo, it should be an object of this form:
*
* let userInfo = {
*   "name": NAME(STRING),
*   "services": SERVICES_DELIMITED_BY_COMMA(STRING),
*   "gender": GENDER(STRING),
*   "sexualPreferences": SEXUAL_PREFERENCE(STRING),
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
        console.log('Starting Database connection');
        try {
            await client.connect();
            console.log('Client connected');
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
            return database.collection(collectionName).distinct("sexualPreference");
        } catch(err) {
            console.log(err.stack);
        }
    }

    this.updateUserInformation = async function(userInfo){
        try {
            
            let cursor = database.collection(collectionName).find({
                "name": userInfo.name.toString()
            });
            let cursorArray = await cursor.toArray();
            console.log('Update User Info: ' + JSON.stringify(cursorArray)+'length: ' + cursorArray.length);
            if (cursorArray.length == 0) {
                await database.collection(collectionName).insertOne({
                    "name": userInfo.name.toString(),
                    "services": userInfo.services.toString(),
                    "gender": userInfo.gender.toString(),
                    "sexualPreferences": userInfo.sexualPreferences.toString(),
                    "contactInfo": userInfo.contactInfo.toString()
                }).catch(console.dir);
                console.log('Succesfully? inserted');
                return new Promise((resolve,reject) => { resolve(1) });
            } else {
                await database.collection(collectionName).updateOne(
                    { "name": userInfo.name.toString() },
                    { $set: {
                            "services": cursorArray[0].services.toString().concat(",", userInfo.services),
                            "gender": userInfo.gender.toString(),
                            "sexualPreferences": userInfo.sexualPreferences.toString(),
                            "contactInfo": userInfo.contactInfo.toString()
                        }}
                );
                console.log('Succesfully? updated')
                return new Promise((resolve,reject) => { resolve(1) });
            }
        } catch(err) {
            console.log(err.stack);
            return new Promise((resolve,reject) => { reject(0) });
        }
    
    }

    this.getUserInformation = async function(userInfo){
        try {
            let cursor = database.collection(collectionName).find({
                "name": userInfo.name.toString()
            });
            let cursorArray = await cursor.toArray();
            return new Promise((resolve, reject) => {
                console.log('Get User Info: ' + JSON.stringify(cursorArray)+'length: ' + cursorArray.length);
                if (cursorArray.length == 0) {
                    resolve({});
                } else {
                    resolve({
                        "name": cursorArray[0].name.toString(),
                        "services": cursorArray[0].services.toString(),
                        "gender": cursorArray[0].gender.toString(),
                        "sexualPreferences": cursorArray[0].sexualPreferences.toString(),
                        "contactInfo": cursorArray[0].contactInfo.toString()
                    });
                }
            });
            
        } catch(err) {
            console.log(err.stack);
        }
    }

    this.getMatchingUsers = async function(userInfo){
        try {
            let cursor = database.collection(collectionName).find({
                "name": { $ne: userInfo.name.toString() },
                "gender": { $in: userInfo.sexualPreferences.toString().split(",") },
                "sexualPreferences": { $regex : "".concat(".*", userInfo.gender.toString(), ".*") }
            });
            let cursorArray = await cursor.toArray();

            return new Promise((resolve, reject) => {
                if (cursorArray.length == 0) {
                    resolve([]);
                } else {
                    let results = [];

                    for (let i = 0; i < cursorArray.length; i++) {
                        results.concat({
                            "name": cursorArray[i].name.toString(),
                            "services": cursorArray[i].services.toString(),
                            "gender": cursorArray[i].gender.toString(),
                            "sexualPreferences": cursorArray[i].sexualPreferences.toString(),
                            "contactInfo": cursorArray[i].contactInfo.toString()
                        })
                    }

                    resolve(results);
                }   
            });
            
        } catch(err) {
            console.log(err.stack);
        }
    }

}

module.exports = DatabaseHelper;

// call like this:
// DatabaseHelper.startDatabaseConnection().catch(console.dir);
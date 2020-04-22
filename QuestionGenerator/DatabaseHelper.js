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

    this.updateUserInfo = async function(userInfo){
        try {
            let cursor = collection.find({
                name: userInfo.name
            });
            let cursorArray = cursor.toArray();

            if (cursorArray.length == 0) {
                await collection.insertOne({
                    name: userInfo.name,
                    services: userInfo.services,
                    gender: userInfo.gender,
                    sexualPreference: userInfo.sexualPreference,
                    contactInfo: userInfo.contactInfo
                });
            } else {
                await collection.updateOne(
                    { name: userInfo.name },
                    { $set: {
                            services: cursorArray[0].services.toString().concat(",", userInfo.services),
                            gender: userInfo.gender,
                            sexualPreference: userInfo.sexualPreference,
                            contactInfo: userInfo.contactInfo
                        }}
                );
            }
        } catch(err) {
            console.log(err.stack);
        }
    }

    this.getUserInfo = async function(userInfo){
        try {
            let cursor = collection.find({
                name: userInfo.name
            });
            let cursorArray = cursor.toArray();

            if (cursorArray.length == 0) {
                return null;
            } else {
                return {
                    name: cursorArray[0].name.toString(),
                    services: cursorArray[0].services.toString(),
                    gender: cursorArray[0].gender.toString(),
                    sexualPreference: cursorArray[0].sexualPreference.toString(),
                    contactInfo: cursorArray[0].contactInfo.toString()
                }
            }
        } catch(err) {
            console.log(err.stack);
        }
    }

    this.getMatchingUsers = async function(userInfo){
        try {
            let cursor = collection.find({
                name: { $ne: userInfo.name },
                gender: { $in: userInfo.sexualPreference.split(",") },
                sexualPreference: { $regex : "".concat(".*", userInfo.gender, ".*") }
            });
            let cursorArray = cursor.toArray();

            if (cursorArray.length == 0) {
                return null;
            } else {
                let results = [];

                for (let i = 0; i < cursorArray.length; i++) {
                    results.concat({
                        name: cursorArray[i].name.toString(),
                        services: cursorArray[i].services.toString(),
                        gender: cursorArray[i].gender.toString(),
                        sexualPreference: cursorArray[i].sexualPreference.toString(),
                        contactInfo: cursorArray[i].contactInfo.toString()
                    })
                }

                return results;
            }
        } catch(err) {
            console.log(err.stack);
        }
    }

}

module.exports = DatabaseHelper;

// call like this:
// DatabaseHelper.startDatabaseConnection().catch(console.dir);
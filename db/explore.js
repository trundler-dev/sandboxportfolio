const mongo = require('./mongo');
const ObjectId = require('mongodb').ObjectID;

class Explore {

    constructor(db) {
        this.db = db;
    }

    async findNRandUsers(n) {
        const sdb = await this.db.get();
        return sdb.collection('users').aggregate(
            {
                $match: {
                    username: { $exists: true }
                }
            },
            {
                $sample: {
                    size: n
                }
            }).toArray();
    }

}

module.exports = new Explore(mongo);
const mongo = require('./mongo');
const ObjectId = require('mongodb').ObjectID;

class Users {

    constructor(db) {
        this.db = db;
    }

    async saveUser(googleId, email) {
        const sdb = await this.db.get();
        await sdb.collection('users').insertOne({
            googleId: googleId,
            email: email
        });

        return sdb.collection('users').findOne({
            googleId: googleId
        });
    }

    async setRegistered(username, id) {
        const sdb = await this.db.get();
        return sdb.collection('users').updateOne({
            _id: id
        },
        {
            $set: {
                username: username
            }
        });
    }

    async findUserByGoogleId(googleId) {
        const sdb = await this.db.get();
        return sdb.collection('users').findOne({
            googleId: googleId
        });
    }

    async findUserById(id) {
        const sdb = await this.db.get();
        return sdb.collection('users').findOne({
            _id: new ObjectId(id)
        });
    }

    async findUserByName(username) {
        const sdb = await this.db.get();
        return sdb.collection('users').findOne({
            username: username
        })
    }

    async updatePortfolio(id, portfolio) {
        const sdb = await this.db.get();
        return sdb.collection('users').updateOne({
            _id: id
        },
        {
            $set: {
                portfolio: portfolio
            }
        });
    }

    async deleteUserById(id) {
        const sdb = await this.db.get();

        const userExists = await sdb.collection('users').findOne({
            _id: new ObjectId(id)
        });
        if (userExists) {
            await sdb.collection('users').deleteOne({
                _id: new ObjectId(id)
            });
        }
    }
}

module.exports = new Users(mongo);
const MongoClient = require('mongodb').MongoClient;

class MongoDatabase {

    constructor(uri, dbName, dbConfig) {
        this.uri = uri;
        this.dbName = dbName;
        this.dbConfig = dbConfig;
        this.database = undefined;
    }

    async get() {
        if (!this.database) {
            const connect = await MongoClient.connect(this.uri, this.dbConfig);
            this.database = connect.db(this.dbName);
        }
        return this.database;
    }
}

module.exports = new MongoDatabase(process.env.MONGO_CONNECT_STRING, process.env.MONGO_DB_NAME, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

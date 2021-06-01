const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redisClient = require('./store');

const configuredSession = session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore({client: redisClient}),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: parseInt(process.env.SESSION_LENGTH)
    }
});

module.exports = configuredSession;
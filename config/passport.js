const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const users = require('../db/users');

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_REDIRECT_URL
    }, (accessToken, refreshToken, content, callback) => {
        const userInfo = content['_json'];
        const googleId = userInfo['sub'];
        const email = userInfo['email'];

        users.findUserByGoogleId(googleId)
            .then((existingUser) => {
                if (existingUser) {
                    callback(null, existingUser);
                } else {
                    users.saveUser(googleId, email)
                        .then((newUser) => {
                            callback(null, newUser);
                        })
                        .catch((err) => {
                            callback(err);
                        });
                }
            })
            .catch((err) => {
                callback(err);
            });
    })
);

passport.serializeUser( (user, callback) => {
    if (user && typeof user._id !== 'undefined') {
        callback(null, user._id);
    } else {
        callback(null, null);
    }
});

passport.deserializeUser( (id, callback) => {
    if (typeof id !== 'string') {
        callback(null, null);
    }

    users.findUserById(id)
        .then((user) => {
            if (user) {
                const userData = {};
                userData.id = user._id;
                userData.username = user.username;
                callback(null, userData);
            } else {
                callback(null, null);
            }
        })
        .catch((err) => {
            callback(err);
        });
});

module.exports = passport;
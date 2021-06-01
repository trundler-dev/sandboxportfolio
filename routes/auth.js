const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const users = require('../db/users');

router.get('/sso', (req, res, next) => {
    res.render('auth');
});

router.get('/google', passport.authenticate('google', {
    scope: ['email']
}));

router.get('/google/redirect', passport.authenticate('google'), (req, res, next) => {
    res.redirect('/auth/register');
});

router.get('/register', (req, res, next) => {
    if (!res.locals.userState.isLoggedIn) {
        res.redirect('/login');
    } else {
        users.findUserById(req.user.id)
            .then((user) => {
                if (user && user.username) {
                    res.redirect('/');
                } else {
                    const data = {};
                    data.pageTitle = 'Create an account';
                    data.errors = req.session.errors;
                    delete req.session.errors;
                    res.render('register', data);
                }
            })
            .catch(next);
    }
});

router.post('/register', (req, res, next) => {
    const username = req.body.username;

    users.setRegistered(username, req.user.id)
        .then(() => {
            res.redirect('/');
        })
        .catch(next);
});

module.exports = router
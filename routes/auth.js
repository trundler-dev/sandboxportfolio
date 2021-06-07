const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const users = require('../db/users');
const { check, validationResult, body } = require('express-validator');

const registrationValidation = [
    body(
        'username',
        'Usernames must be between 3 and 30 characters long.'
    )
        .isLength({min: 3, max: 30}),
    body(
        'username',
        'Usernames can only have letters and numbers.'
    )
        .matches(/^[A-Za-z0-9]+$/),
    body(
        'username',
        'That username is already taken. Please choose a different one.'
    )
        .custom((value) => {
            return users.findUserByName(value)
                .then((user) => {
                    if (user) {
                        return Promise.reject();
                    }
                });
        })
];

router.get('/sso', (req, res, next) => {
    res.render('auth', { pageTitle: 'Sign In' });
});

router.get('/google', passport.authenticate('google', {
    scope: ['email']
}));

router.get('/google/redirect', passport.authenticate('google'), (req, res, next) => {
    res.redirect('/auth/register');
});

router.get('/register', (req, res, next) => {
    if (!res.locals.userState.isLoggedIn) {
        res.redirect('/auth/sso');
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

router.post('/register', registrationValidation, (req, res, next) => {
    const username = req.body.username;
    const errors = validationResult(req);
    console.log(errors);

    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        req.session.registrationForm = {
            username: req.body.username
        };
        res.redirect('/auth/register');
    } else {
        users.setRegistered(username, req.user.id)
            .then(() => {
                res.redirect('/');
            })
            .catch(next);
    }
});

router.get('/manage', (req, res, next) => {
    if (!res.locals.userState.isLoggedIn) {
        res.redirect('/auth/sso');
    } else {
        const data = {};
        if (req.session && req.session.errors) {
            data.errors = req.session.errors;
            req.session.errors = [];
        }
        res.render('manage', data);
    }
});

router.get('/logout', (req, res, next) =>  {
    req.session.destroy();
    res.redirect('/');
});

router.post('/delete',
    [
        body(
            'delete-check',
            'To delete your account please check the confirmation box.'
        ).exists()
    ], (req, res, next) => {
        if (res.locals.userState.isRegistered) {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                req.session.errors = errors.array();
                res.redirect('/auth/manage');
            } else {
                users.deleteUserById(req.user.id)
                    .then(() => {
                        req.session.destroy();
                        res.redirect('/');
                    })
                    .catch(next);
            }
        } else {
            res.redirect('/');
        }
});

module.exports = router
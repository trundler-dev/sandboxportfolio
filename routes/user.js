const express = require('express');
const router = express.Router();
const users = require('../db/users');
const md = require('markdown-it')();
const { validationResult, body } = require('express-validator');

const portfolioValidation = [
    body(
        'portfolio',
        'A portfolio has a maximum length of 2000 characters.')
            .trim()
            .isLength({max: 2000})
];

async function loadUser(username) {
    const user = await users.findUserByName(username);
    if (!user) { return null };

    const result = {};
    result.user = user;
    result.pageTitle = user.username + "'s Portfolio";
    result.username = user.username
    result.shareUrl = 'https://sandboxportfolio.com/user/' + user.username;
    result.portfolio = md.render(user.portfolio);
    console.log(user);
    return result;
}

router.get('/:username', (req, res, next) => {
    loadUser(req.params.username)
        .then((data) => {
            if (!data) {
                const err = new Error('No such user.');
                err.status = 404;
                throw err;
            } else {
                data.isOwnUser = res.locals.userState.isRegistered && (req.user.username === req.params.username);
                res.render('user', data);
            }
        })
        .catch(next);
});

router.get('/:username/edit', (req, res, next) => {
    if (!res.locals.userState.isLoggedIn) {
        res.redirect('/login');
    }
    if (!res.locals.userState.isRegistered || req.user.username !== req.params.username) {
        res.redirect('/');
    }
    loadUser(req.params.username)
        .then((data) => {
            res.render('edit', data);
        })
        .catch(next);
});

router.post('/:username/edit', portfolioValidation, (req, res, next) => {
    const portfolio = req.body['portfolio'].trimEnd();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect('/user/' + req.params.username + '/edit');
    } else {
        users.updatePortfolio(req.user.id, portfolio)
            .then(() => {
                res.redirect('/user/' + req.params.username);
            })
            .catch(next);
    }
});

module.exports = router;
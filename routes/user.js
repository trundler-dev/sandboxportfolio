const express = require('express');
const router = express.Router();
const users = require('../db/users');
const userTags = require('../helpers/consts').userTags;
const md = require('markdown-it')();
const { validationResult, body } = require('express-validator');

const portfolioValidation = [
    body(
        'portfolio',
        'A portfolio has a maximum length of 4000 characters.')
            .trim()
            .isLength({max: 4000})
];

async function loadUser(username) {
    const user = await users.findUserByName(username);
    if (!user) { return null };

    const result = {};
    result.user = user;
    result.pageTitle = user.username + "'s Portfolio";
    result.username = user.username
    result.shareUrl = 'https://sandboxportfolio.com/user/' + user.username;
    if (user.portfolio) {
        result.portfolio = md.render(user.portfolio);
        result.portfolioRaw = user.portfolio;
    }
    if (user.summary) {
        result.summary = user.summary;
    }
    result.userTags = userTags.filter(n => !user.tags.includes(n));
    result.activeTags = user.tags;
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
        res.redirect('/auth/sso');
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
    const summary = req.body['summary'].trimEnd();
    let i = 0;
    const tags = [];
    for (let key in req.body) {
        if (key.includes('tag')) {
            tags[i] = key.replace('tag_', '');
            i++;
        }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.session.errors = errors.array();
        res.redirect('/user/' + req.params.username + '/edit');
    } else {
        users.updatePortfolio(req.user.id, portfolio, summary, tags)
            .then(() => {
                res.redirect('/user/' + req.params.username);
            })
            .catch(next);
    }
});

module.exports = router;
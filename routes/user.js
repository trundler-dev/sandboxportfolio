const express = require('express');
const router = express.Router();
const users = require('../db/users');

async function loadUser(username) {
    const user = await users.findUserByName(username);
    if (!user) { return null };

    const result = {}
    result.user = user;
    result.pageTitle = user.username + "'s Portfolio";
    result.username = user.username
    result.shareUrl = 'https://sandboxportfolio.com/user/' + user.username;
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

module.exports = router;
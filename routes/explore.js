const express = require('express');
const router = express.Router();
const explore = require('../db/explore');

async function loadExplore(n) {
    const users = await explore.findNRandUsers(n);
    const result = {};
    result.users = users;
    result.pageTitle = 'Explore';
    return result;
}

router.get('/', (req, res, next) => {
    loadExplore(10)
        .then((data) => {
            console.log(data);
            res.render('explore', data)
        })
        .catch(next);

});

module.exports = router;
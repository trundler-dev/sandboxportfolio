const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    const data = {};
    data.pageTitle = 'Explore';
    res.render('explore', data)
});

module.exports = router;
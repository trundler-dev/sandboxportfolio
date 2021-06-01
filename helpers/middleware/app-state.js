module.exports = (req, res, next) => {
    res.locals.userState = {};
    if (req.user) {
        res.locals.userState.isLoggedIn = typeof req.user.id !== 'undefined';
        res.locals.userState.isRegistered = typeof req.user.username !== 'undefined';
        res.locals.userState.username = req.user.username;
    }

    next();
};
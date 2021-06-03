const createError = require('http-errors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const hbs = require('express-handlebars')
const passport = require('./config/passport');
const session = require('./config/session/middleware');
const appState = require('./helpers/middleware/app-state');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const exploreRouter = require('./routes/explore');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
const handlebars = hbs.create({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials'
});
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.disable('x-powered-by');

// Passport and Session
app.set('trust proxy', 1)
app.use(session)
app.use(passport.initialize());
app.use(passport.session());
app.use(appState);

// Routers setup
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/user', userRouter);
app.use('/explore', exploreRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

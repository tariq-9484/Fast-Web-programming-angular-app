var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var path = require('path');
var apiRouter = require('./routes/apiRoutes');
var Router = require('./routes/routes');
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
const dbString = require('./config/db.config.js');
var app = express();


// Configure bodyparser to handle post requests
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

//Mongo Promise and Connection
mongoose.Promise = global.Promise;
mongoose.connect(dbString.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("DB Connected!!");
}).catch(err => {
    console.log("DB Connection failed !!");
    process.exit();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', apiRouter);
app.use('/', Router);

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

app.listen(8080, function() {
    console.log("Server running at " + 8080);
});

module.exports = app;
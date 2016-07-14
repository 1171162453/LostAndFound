require('events').EventEmitter.prototype._maxListeners = 200;

var express = require('express');
var app = express();
var routes = require('./routes/index');

var settings = require('./settings');

var session = require('express-session');
// var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');

// app set
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


app.use(express.static(__dirname + '/public'));
app.use(require('body-parser')());

app.use(require('cookie-parser')(settings.cookieSecret));
app.use(session({
  secret: settings.cookieSecret,
  key: 'sid',  // cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 7}, // 7 days
  // store: new MongoStore({
  //   db: settings.db,
  //   host: settings.host,
  //   port: settings.port,
  // })
}));
app.use(flash());

routes(app);

app.listen(3000);

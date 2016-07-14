module.exports = function(app) {
  require('./login')(app);
  require('./home')(app);
  require('./register')(app);
  require('./logout')(app);
  require('./post')(app);
  require('./search')(app);
  require('./user')(app);
}

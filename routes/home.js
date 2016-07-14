var Post = require('../models/post');

module.exports = function(app) {
  app.get('/', function (req, res) {
    Post.getPosts({postType: 1}, {startTime: -1}, function(err, losts) {
      if (err) {
        return res.redirect('/');
      }
      Post.getPosts({postType: 0}, {startTime: -1}, function(err, founds) {
        if(err) {
          return res.redirect('/');
        }
        res.render('home', {
          user: req.session.user,
          message: req.flash('message').toString(),
          title: "中大失物招领",
          losts: losts,
          founds: founds
        });
      });
    });
  });
}

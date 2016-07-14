var User = require('../models/user');

module.exports = function(app) {
  app.get('/login', function(req, res) {
    res.render('login', {
      user: req.session.user,
      message: req.flash('message').toString(),
      title: "登陆中大失物招领"
    });
  });

  app.post('/login', function(req, res) {
    User.getUsers({email: req.body['email'], password: req.body['password']},{},function(err, users){
      if (err) {
        req.flash('message', "登录失败，请重试！");
        return res.redirect('/login');
      }
      if (users.length > 0) {
        req.session.user = users[0];
        return res.redirect('/');
      }
      req.flash('message', "邮件或密码错误，请重新登陆！");
      return res.redirect('/login');
    });
  });

  app.post('/alogin', function(req, res) {
    User.getUsers({email: req.body['email'], password: req.body['password']},{},function(err, users){
      if (err) {
        return res.send({success: false, message:'登录失败，请重试！'});
      }
      if (users.length > 0) {
        req.session.user = users[0];
        return res.send({success: true});
      }
      return res.send({success: false, message: '邮件或密码错误，请重新登陆！'});
    });
  });
}

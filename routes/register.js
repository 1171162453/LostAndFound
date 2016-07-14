var User = require('../models/user');

module.exports = function(app) {
  app.get('/register', function(req, res) {
    res.render('register', {
      user: req.session.user,
      message: req.flash('message').toString(),
      title: "注册中大失物招领"
    });
  });
  app.post('/register', function(req, res) {
    // 检验用户两次输入口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
      req.flash('message', "两次密码输入不一致！");
      return res.redirect('/register');
    }
    User.addUser({
      name: req.body['username'],
      email: req.body['email'],
      password: req.body['password']
    }, function(err, result) {
      if (err) {
        req.flash('message', err);
        return res.redirect('/register');
      }
      User.getUsers({name: req.body['username']},{},function(err, users){
        if (err) {
          req.flash('message', "注册成功！请登陆！");
          return res.redirect('/login');
        }
        user = users[0];
        req.session.user = user;
        req.flash('message', "注册成功！欢迎光临！");
        return res.redirect('/');
      });
    });
  });

  app.post('/aregister', function(req, res) {
    // 检验用户两次输入口令是否一致
    if (req.body['password-repeat'] != req.body['password']) {
      return res.send({success: false, message: "两次密码输入不一致！"});
    }
    User.addUser({
      name: req.body['username'],
      email: req.body['email'],
      password: req.body['password']
    }, function(err, result) {
      if (err) {
        return res.send({success: false, message: err});
      }
      User.getUsers({name: req.body['username']},{},function(err, users){
        if (err) {
          return res.send({success: true, message: "注册成功！请登录！"});
        }
        req.session.user = users[0];
        return res.send({success: true, message: "注册成功！欢迎光临！"});
      });
    });
  });
}

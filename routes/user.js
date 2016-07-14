var User = require('../models/user');
var Post = require('../models/post');

module.exports = function(app) {
    app.get('/user/:id', function(req, res) {
        var id = parseInt(req.params.id);
        User.getUsers({_id: id},{}, function(err, users) {
            if (err) {
                return res.send(err);
            }
            if (users.length == 0) {
                return res.redirect('/');
            }
            Post.getPosts({uid: id}, {}, function(err, posts) {
                if (err) {
                    return res.send(err);
                }
                res.render('user', {
                    user: req.session.user,
                    title: "用户页面",
                    posts: posts,
                    thisUser: users[0],
                });
            });
        });
    });

    app.get('/userm', function(req, res) {
        if (!req.session.user) {
            req.flash('message', '请登录！');
            return res.redirect('/login');
        }
        return res.render('userM', {
            user: req.session.user,
            title: '修改个人信息',
            message: req.flash('message').toString()
        });
    });

    app.post('/userm', function(req, res) {
        if (!req.session.user) {
            req.flash('message', '请登录！');
            return res.redirect('/login');
        }
        if (req.body['password'] && req.body['password'] != req.body['password-repeat']) {
            req.flash('message', '两次输入密码不一致！');
            return res.redirect('back');
        }
        var eUser = {};
        if (req.body['password'] && req.body['password'] == req.body['password-repeat']) {
            eUser.password = req.body['password'];
        }
        eUser._id = req.session.user._id;
        eUser.name = req.body['name'];
        eUser.phone = req.body['phone'];
        eUser.qq = req.body['qq'];
        eUser.gender = req.body['gender'];
        eUser.info = req.body['info'];
        User.editUser(eUser, function(err) {
            if (err) {
                req.flash('message', '修改失败，请重试！');
                return res.redirect('back');
            }
            req.session.user.name = eUser.name;
            req.session.user.phone = eUser.phone;
            req.session.user.qq = eUser.qq;
            req.session.user.gender = eUser.gender;
            req.session.user.info = eUser.info;
            req.flash('message', '修改成功！');
            return res.redirect('back');
        });
    });

    app.post('/photo', function(req, res) {
        return res.redirect('back');
    });
}
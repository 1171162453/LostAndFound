var Post = require('../models/post');
var User = require('../models/user');
var Comment = require('../models/comment');

module.exports = function(app) {
    app.get('/lost/:page?', function(req, res) {
        Post.getPosts({postType: 1}, {startTime: -1}, function(err, posts) {
            if (err) {
                return res.redirect('/lost');
            }
            return res.render('list', {
                user: req.session.user,
                title: "寻物帖列表",
                posts: posts
            });
        });
    });

    app.get('/alost', function(req, res) {
        if (!req.session.user) {
            req.flash('message','丢失物品发帖需要先登录');
            return res.redirect('/login');
        }
        return res.render('apost', {
            apost: {
                action: '/alost',
                title: '寻物信息登记表',
                type: '丢失',
            },
            user: req.session.user,
            title: "丢失物品发帖"
        });
    });

    app.post('/alost', function(req, res) {
        if (!req.session.user) {
            req.flash('message','丢失物品发帖需要先登录');
            return res.redirect('/login');
        }
        Post.addPost({
            uid: req.session.user._id,
            postType: 1,
            itemCategory: req.body['itemCategory'],
            itemName: req.body['itemName'],
            itemTime: new Date(req.body['itemTime']),
            itemPlace: req.body['itemPlace'],
            itemDetial: req.body['itemDetial'],
            itemContact: req.body['itemContact']
        }, function(err, result) {
            if (err) {
                return res.redirect('/alost');
            }
            return res.redirect('/');
        });
    });

    app.get('/found/:page?', function(req, res) {
        Post.getPosts({postType: 0}, {startTime: -1}, function(err, posts) {
            if (err) {
                return res.redirect('/lost');
            }
            res.render('list', {
                user: req.session.user,
                title: "招领帖列表",
                posts: posts
            });
        });
    });

    app.get('/afound', function(req, res) {
        if (!req.session.user) {
            req.flash('message','捡到物品发帖需要先登录');
            return res.redirect('/login');
        }
        return res.render('apost', {
            apost: {
                action: '/afound',
                title: '招领信息登记表',
                type: '捡到',
            },
            user: req.session.user,
            title: "捡到物品发帖"
        });
    });

    app.post('/afound', function(req, res) {
        if (!req.session.user) {
            req.flash('message','捡到物品发帖需要先登录');
            return res.redirect('/login');
        }
        Post.addPost({
            uid: req.session.user._id,
            postType: 0,
            itemCategory: req.body['itemCategory'],
            itemName: req.body['itemName'],
            itemTime: new Date(req.body['itemTime']),
            itemPlace: req.body['itemPlace'],
            itemDetial: req.body['itemDetial'],
            itemContact: req.body['itemContact']
        }, function(err, result) {
            if (err) {
                return res.redirect('/afound');
            }
            return res.redirect('/');
        });
    });

    app.get('/post/:id', function(req, res) {
        var pid = parseInt(req.params.id);
        Post.getPosts({_id: pid}, {}, function(err, posts) {
            if (err || posts.length == 0) {
                return res.redirect('/');
            }
            var uid = parseInt(posts[0].uid);
            User.getUsers({_id: uid}, {}, function(err, users) {
                if (err || users.length == 0) {
                    return res.redirect('back');
                }
                posts[0].author = users[0];
                Comment.getComments({pid: posts[0]._id}, {}, function(err, comments) {
                    if(err) {
                        return res.redirect('back');
                    }
                    var temp = [];
                    for (var i = 0; i < comments.length; i++) {
                        temp.push({_id: comments[i].uid});
                    }
                    if (temp.length > 0) {
                        User.getUsers({$or: temp}, {}, function(err, users) {
                            if(err) {
                                return res.redirect('back');
                            }
                            var CUdic = {};
                            for (var i = 0; i < users.length; i++) {
                                CUdic[users[i]._id] = users[i];
                            }
                            for (var i = 0; i < comments.length; i++) {
                                comments[i].user = CUdic[comments[i].uid];
                            }
                            return res.render('post', {
                                user: req.session.user,
                                title: '详细信息',
                                message: req.flash('message').toString(),
                                post: posts[0],
                                comments: comments
                            });
                        });
                    }
                    else {
                        return res.render('post', {
                            user: req.session.user,
                            title: '详细信息',
                            message: req.flash('message').toString(),
                            post: posts[0],
                            comments: comments
                        });
                    }
                });
            });
        });
    });

    app.post('/acomment', function(req, res) {
        if (!req.session.user) {
            return res.send({login: false});
        }
        var newComment = {};
        newComment.pid = parseInt(req.body['pid']);
        newComment.uid = req.session.user._id;
        newComment.content = req.body['content'];
        Comment.addComment(newComment, function(err, result) {
            if(err) {
                return res.send({login: true, success: false});
            }
            newComment.createTime = new Date();
            User.getUsers({_id: newComment.uid}, {}, function(err, users) {
                if (err) {
                    return res.redirect('back');
                }
                newComment.user = users[0];

                return res.send({login: true, success: true, comment: newComment});
            });
        });
    });
}







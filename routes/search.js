var Post = require('../models/post');

module.exports = function(app) {
    app.get('/search', function(req, res) {
        res.render('search', {
            user: req.session.user,
            message: req.flash('message').toString(),
            title: "高级搜索",
            posts: []
        });
    });

    app.post('/search', function(req, res) {
        var keywords = req.body['keywords'];
        Post.getPosts({
            $or: [{itemName: {$regex: keywords, $options: '$i'}}, 
            {itemCategory: {$regex: keywords, $options: '$i'}}, 
            {itemPlace: {$regex: keywords, $options: '$i'}}, 
            {itemDetial: {$regex: keywords, $options: '$i'}}]
        }, {}, function(err, posts) {
            if (err) {
                return res.redirect('/search');
            }
            res.render('search', {
                user: req.session.user,
                message: req.flash('message').toString(),
                title: "高级搜索",
                posts: posts
            })
        });
    });
}
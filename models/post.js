var mongodb = require('./db');

function Post(post) {
  this._id = post._id;
  this.uid = post.uid;
  this.status = post.status || 0; // 0 为未完成，1 为已经完成。
  this.startTime = post.startTime;
  this.finishTime = post.finishTime;
  this.postType = post.postType; // 0 为招领信息found，1 为寻物信息lost。
  this.itemCategory = post.itemCategory;
  this.itemName = post.itemName;
  this.itemTime = post.itemTime;
  this.itemPlace = post.itemPlace;
  this.itemDetial = post.itemDetial;
  this.itemContact = post.itemContact;
}

module.exports = Post;

// 通过特定 query 读取多条Post消息，其中 query 为形如 {_id: 10000000} 的键值类型
// sortRE 为排序参数，形如 {_id: -1} 逆序
// 返回 Post 类的数组
Post.getPosts = function(query, sortRE, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        console.log("读取 posts 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 根据 query 查找 posts 集合
      collection.find(query).sort(sortRE).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        var posts = [];
        docs.forEach(function(doc) {
          posts.push(new Post(doc));
        });
        return callback(null, posts);
      });
    });
  });
};


// 添加新 post，必须有 uid，postType，itemCategory，itemName，itemTime，itemPlace，
// itemDetial，itemContact 属性，前置默认有这些属性。无 _id 属性。
Post.addPost = function(newPost, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        console.log("读取 posts 集合错误");
        mongodb.close();
        return callback(err);
      }
      var _id = 10000000;
      collection.find().limit(1).sort({_id: -1}).toArray(function(err, docs) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        if (docs.length > 0) {
          _id = docs[0]._id + 1;
        }
        collection.ensureIndex({uid: 1, postType: 1, itemCategory: 1});
        newPost.startTime = new Date();
        newPost._id = _id;
        collection.insertOne(newPost, function(err, result) {
          mongodb.close();
          if (err) {
            return callback("添加Post失败！");
          }
          callback(null, result);
        });
      });
    });
  });
};


// 修改 post 信息，其中 ePost 必须有 _id 以及要修改的其他属性。
// 通过 _id 查找到用户进而修改。默认 _id 在数据中存在。
Post.editPost = function(ePost, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        console.log("读取 posts 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      collection.update({
        _id: ePost._id
      }, {
        $set: ePost
      }, function(err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};


// 根据 query 查询删除 post
Post.removePost = function(query, callback){
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 posts 集合
    db.collection('posts', function(err, collection) {
      if (err) {
        console.log("读取 posts 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 根据 query 查询删除操作
      collection.remove(query, function(err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};



//  For test


// Post.removePost({_id:  10000003}, function(err) {
//   if (err) {
//     console.log("删除操作错误");
//     return;
//   }
//   console.log("删除操作成功");
// });

// Post.editPost({_id:10000000, uid: 10000000}, function(err) {
//   if (err) {
//     console.log("err!");
//     return;
//   }
//   console.log("succeed!");
// });


// Post.addPost({
//   uid: 10000003,
//   postType: 0,
//   itemCategory: '卡类',
//   itemName: '校卡',
//   itemTime: new Date(),
//   itemPlace: '校道',
//   itemDetial: 'qiujiu',
//   itemContact: '18819481264'
// }, function(err, result) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log('添加成功！');
// });


// Post.getPosts({uid: 10000003},{_id: 1}, function(err, users) {
//   if (err) {
//     console.log('get err');
//     return;
//   }
//   console.log(users);
// });

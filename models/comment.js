var mongodb = require('./db');

function Comment(comment) {
  this._id = comment._id;
  this.pid = comment.pid;
  this.uid = comment.uid;
  this.toUid = comment.toUid;
  this.content = comment.content;
  this.createTime = comment.createTime;
}

module.exports = Comment;

// 通过特定 query 读取多个评论，其中 query 形如 {pid: 1000000} 的键值类型
// sortRE 为排序参数，形如 {createTime: -1} 逆序
// 返回 Comment 类数组
Comment.getComments = function(query, sortRE, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 comments 集合
    db.collection('comments', function(err, collection) {
      if (err) {
        console.log("读取 comments 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 根据 query 查找 comments 集合
      collection.find(query).sort(sortRE).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        var comments = [];
        docs.forEach(function (doc) {
          comments.push(new Comment(doc));
        });
        return callback(null, comments);
      });
    });
  });
};



// 添加一条评论，必须有 pid，uid，content 属性
// 前置默认有 以上属性，toUid 可选，无 _id 属性
Comment.addComment = function(newComment, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 comments 集合
    db.collection('comments', function(err, collection) {
      if (err) {
        console.log("读取 comments 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
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
        collection.ensureIndex({pid: 1});
        newComment._id = _id;
        newComment.createTime = new Date();
        collection.insertOne(newComment, function(err, result) {
          mongodb.close();
          if (err) {
            return callback("添加评论失败！");
          }
          callback(null, result);
        });
      });
    });
  });
}

// 修改评论信息，其中 eComment 必须有 _id 指定要修改的评论
Comment.editComment = function(eComment, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err);  // 错误，返回 err 信息
    }
    // 读取 comments 集合
    db.collection('comments', function(err, collection) {
      if (err) {
        console.log("读取 comments 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      collection.update({
        _id: eComment._id
      }, {
        $set: eComment
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
};

// 删除评论，根据 query 查询后删除，其中 query 形如 {_id: 10000000}
Comment.removeComment = function(query, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 comments 集合
    db.collection('comments', function(err, collection) {
      if (err) {
        console.log("读取 comments 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 根据 query 查询并删除 comments 文档
      collection.remove(query, function(err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    });
  });
}

// For test


// Comment.removeComment({_id: 10000001}, function(err) {
//   if (err) {
//     console.log("删除操作错误");
//     return;
//   }
//   console.log("删除操作成功");
// });


// Comment.editComment({
//   _id: 10000000, uid: 10000001
// }, function(err) {
//   if (err) {
//     console.log("err!");
//     return;
//   }
//   console.log("succeed!");
// });


// Comment.addComment({
//   pid: 10000000, uid: 10000000, toUid: 10000001, content: "你好按时发送"
// }, function(err, result) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log("添加成功！");
// });



// Comment.getComments({}, {createTime: -1}, function(err, comments) {
//   if (err) {
//     console.log("get err");
//     return;
//   }
//   console.log(comments);
// });

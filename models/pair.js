var mongodb = require('./db');


function Pair(pair) {
  this.uid = pair.uid;
  this.pid = pair.pid;
  this.createTime = pair.createTime;
}

module.exports = Pair;


// 通过特定的 query 读取多个 pair，其中 query 为形如 {pid: 10000000} 的键值类型
// sortRE 为排序参数，形如 {createTime: -1} 逆序
// 返回 Pair 类数组
Pair.getPairs = function(query, sortRE, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 pairs 集合
    db.collection('pairs', function(err, collection) {
      if (err) {
        console.log("读取 pairs 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 根据 query 查找 pairs 集合
      collection.find(query).sort(sortRE).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        var pairs = [];
        docs.forEach(function (doc) {
          pairs.push(new Pair(doc));
        });
        return callback(null, pairs);
      });
    });
  });
};


// 增加一条pair，其中 newPair 需要有 pid，uid 属性
Pair.addPair = function(newPair, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 pairs 记录
    db.collection('pairs', function(err, collection) {
      if (err) {
        console.log("读取 pairs 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 添加一条 pair 记录
      newPair.createTime = new Date();
      collection.ensureIndex({uid:1, pid: 1});
      collection.insertOne(newPair, function(err, result) {
        mongodb.close();
        if (err) {
          return callback("添加 pair 失败");
        }
        callback(null, result);
      });
    });
  });
};


// For test


// Pair.getPairs({
//
// }, {
//   uid: -1
// }, function (err, pairs) {
//   if (err) {
//     console.log("get err");
//     return;
//   }
//   console.log(pairs);
// });

//
// Pair.addPair({
//   pid: 10000000,
//   uid: 10000001
// }, function(err, result) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log("添加 pair 成功");
// });

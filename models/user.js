var mongodb = require('./db');

var getPhoto = function() {
  var dic = {
    0: 'default.jpg',
    1: 'default1.jpg',
    2: 'default2.jpg',
    3: 'default3.jpg',
    4: 'default4.jpg',
    5: 'default5.jpg',
    6: 'default6.jpg',
    7: 'default7.jpg',
  };
  return dic[Math.floor(Math.random()*8)];
}

function User(user) {
  this._id = user._id;
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
  this.phone = user.phone || '';
  this.qq = user.qq || '';
  this.gender = user.gender || 'N'; // 默认不确定，男 M  女 F
  this.photo = user.photo || 'default.jpg';
  this.info = user.info || '';
  this.createTime = user.createTime;
  this.status = user.status || '1'; // 1 表示正常
}

module.exports = User;

// 通过特定 query 读取单个用户信息，其中 query 为形如 {name: "ou"} 的键值类型
User.getOne = function(query, callback) {
  // 打开数据库
  mongodb.open(function(err, db){
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        console.log("读取 users 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 根据 query 查找 users 集合
      collection.findOne(query, function(err, user){
        if (err) {
          return callback(err); // 失败，返回 err
        }
        db.close();
        callback(null, user); // 成功，返回查询的用户信息
      });
    });
  });
};

// 通过特定 query 读取多个用户信息，其中 query 为形如 {name: "ou"} 的键值类型
// sortRE 为排序参数，形如 {_id: -1} 逆序
// 返回 User 类的数组
User.getUsers = function(query, sortRE, callback) {
  // 打开数据库
  mongodb.open(function(err, db){
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        console.log("读取 users 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 根据 query 查找 users 集合
      collection.find(query).sort(sortRE).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        var users = [];
        docs.forEach(function (doc) {
          users.push(new User(doc));
        });
        return callback(null, users);
      });
    });
  });
};


// 新用户注册，必须有name，email，password属性，且name和email不能与数据库已有的重复。
// 前置默认有 name，email，password属性
User.addUser = function(newUser, callback) {
  // 打开数据库
  if (!newUser.photo) {
    newUser.photo = getPhoto();
  }
  mongodb.open(function(err, db){
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        console.log("读取 users 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 判断 name是否重复
      collection.findOne({name: newUser.name}, function(err, user){
        if (err) {
          mongodb.close();
          return callback(err); // 查询失败，返回
        }
        if (user) {
          mongodb.close();
          return callback("用户名已存在！");
        }
        collection.findOne({email: newUser.email}, function(err, user) {
          if (err) {
            mongodb.close();
            return callback(err); // 查询失败，返回
          }
          if (user) {
            mongodb.close();
            return callback("Email已经注册！");
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
            newUser.createTime = new Date();
            newUser._id = _id;
            collection.ensureIndex({name: 1, email: 1});
            collection.insertOne(newUser, {safe: true}, function(err, result) {
              mongodb.close();
              if (err) {
                return callback("数据库错误，添加用户失败！");
              }
              callback(null, result);
            });
          });
        });
      });
    });
  });
};


// 修改个人信息，其中 eUser 必须有 _id 以及要修改的其他属性。
// 通过 _id 查找到用户进而修改。默认 _id 在数据中存在。
User.editUser = function(eUser, callback) {
  // 打开数据库
  mongodb.open(function(err, db){
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        console.log("读取 users 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      collection.update({
        _id: eUser._id
      }, {
        $set: eUser
      }, function (err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      }
      );
    });
  });
};

// 删除用户，根据 query 查询后删除，其中 query 形如 {_id: 10000000}
User.removeUser = function(query, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      console.log("打开数据库错误");
      return callback(err); // 错误，返回 err 信息
    }
    // 读取 users 集合
    db.collection('users', function(err, collection) {
      if (err) {
        console.log("读取 users 集合错误");
        mongodb.close();
        return callback(err); // 错误，返回 err 信息
      }
      // 根据 query 删除 users 文档
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

// for test


// User.removeUser({_id: 10000002}, function(err) {
//   if (err) {
//     console.log("删除操作错误");
//     return;
//   }
//   console.log("删除操作成功");
// });


// User.editUser({_id:10000002, name:'oujiaiq', gender: "M"}, function(err) {
//   if (err) {
//     console.log("err!");
//     return;
//   }
//   console.log("succeed!");
// });


// User.addUser({name: "1s112", password: "o1u", email: "1o1s1u"}, function(err, result) {
//   if (err) {
//     console.log(err);
//     return;
//   }
//   console.log(result);
// });



// User.getUsers({email: '3', password: '3'}, {}, function(err, users){
//   if (err) {
//     console.log('get err');
//     return;
//   }
//   console.log(users);
// });


// User.getOne({name:1}, function(err, user){
//   if (err) {
//     console.log('get err');
//     return;
//   }
//   console.log(user);
// });

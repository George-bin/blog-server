const router = require("./index.js");
const model = require("./models/model.js");
const Notebook = model.Notebook.Notebook;
const Note = model.Note.Note;
const User = model.User.User;
const { updateDocPropsFilter } = require('../../utils/common')

// 999：数据库操作失败
// 992：密码错误
// 993：该用户不存在

// 用户登录
router.post("/login", function(req, res, next) {
  console.log("用户登录");
  let { account } = req.body;
  User.findOne({ account: account }, function(err, user) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "查询用户信息失败!"
      });
    }
    if (user) {
      user = JSON.parse(JSON.stringify(user));
      if (user.password === req.body.password) {
        // 添加session
        req.session.userInfo = {
          account: user._id
        };
        delete user.password;
        // Note.updateMany({
        //   account: user.account
        // }, {
        //   account: user._id
        // }, function (err, data) {
        //   if (err) {
        //     return res.send({
        //       errcode: 992,
        //       message: "修改数据库失败!"
        //     });
        //   }
        // })
        // Notebook.updateMany({
        //   account: user.account
        // }, {
        //   account: user._id
        // }, function (err, data) {
        //   if (err) {
        //     return res.send({
        //       errcode: 992,
        //       message: "修改数据库失败!"
        //     });
        //   }
        // })
        return res.send({
          errcode: 0,
          message: "登录成功!",
          userInfo: user
        });
      }
      res.send({
        errcode: 992,
        message: "密码错误!"
      });
    } else {
      res.send({
        errcode: 993,
        message: "该用户不存在!"
      });
    }
  });
});

// 用户注册
router.post("/register", function(req, res, next) {
  User.find({ account: req.body.account }, function(err, data) {
    if (err) return console.log(err);
    if (data.length > 0) {
      res.send({
        errcode: 1,
        message: "用户已注册!"
      });
      return;
    }
    const user = new User({
      ...req.body
    });
    user.save(function(err2, user) {
      if (err) return console.log(err);
      const notebook = new Notebook({
        name: '笔记本', // 笔记本名称
        account: user._id, // 所属用户
        createTime: Date.now(), // 创建时间
        updateTime: null, // 更新时间
        PARENT_CODE: -1, // 父级节点的code
        grade: 1 // 节点等级
      });
      notebook.save(function(err, notebook) {
        if (err) {
          res.send({
            errcode: 999,
            message: "网络错误!"
          });
          return;
        }
        res.send({
          errcode: 0,
          message: "注册成功!"
        });
      });
    });
  });
});

// 用户注销
router.post("/logon", function(req, res, next) {
  //注销session
  req.session.destroy(function(err){
    res.send({
      errcode: 0,
      message: "注销成功!"
    });
  });
});

// 更新用户信息
router.put("/user", function(req, res, next) {
  let d = JSON.parse(JSON.stringify(req.body))
  User.findOne({ _id: req.body._id }, function (err, note) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "查询数据库失败!"
      });
    }
    if (d.password && d.newPassword) {
      if (note.password !== d.password) {
        return res.send({
          errcode: 992,
          message: "原密码输入错误，请重新输入!"
        });
      } else {
        d.password = d.newPassword;
      }
    } else {
      delete d.password;
    }
    delete d.newPassword;
    let props = updateDocPropsFilter(d)
    User.findOneAndUpdate(
      { _id: d._id },
      {
        ...props
      },
      { new: true },
      function (err, user) {
        if (err) {
          return res.send({
            errcode: 999,
            message: "更新数据库失败!"
          });
        }
        let userInfo = JSON.parse(JSON.stringify(user))
        userInfo.password = ''
        if (req.body.password && req.body.newPassword) {
          req.session.destroy(function(err){
            res.send({
              errcode: 0,
              message: "更新用户信息成功!",
              userInfo
            });
          });
        } else {
          res.send({
            errcode: 0,
            message: "更新用户信息成功!",
            userInfo
          });
        }
      }
    )
  })
});

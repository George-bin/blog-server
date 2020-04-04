const router = require("./index.js");
const model = require("./models/model.js");
const Notebook = model.Notebook.Notebook;
const User = model.User.User;

// 999：数据库操作失败
// 992：密码错误
// 993：该用户不存在

// 用户登录
router.post("/login", function(req, res, next) {
  console.log("用户登录");
  let { account } = req.body;
  User.find({ account: account }, function(err, data) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "查询用户信息失败!"
      });
    }
    if (data.length > 0) {
      let user = JSON.parse(JSON.stringify(data[0]));
      if (user.password === req.body.password) {
        // 添加session
        req.session.userInfo = {
          account: account
        };
        delete user.password;
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
    user.save(function(err2, users) {
      if (err) return console.log(err);
      const notebook = new Notebook({
        name: '笔记本', // 笔记本名称
        account: req.body.account, // 所属用户
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
  delete req.session[req.sessionID];
  res.cookie("sessionId", "", { expires: 0, httpOnly: true });
  res.send({
    errcode: 0,
    message: "注销成功!"
  });
});
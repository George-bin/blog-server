const crypto = require("crypto");
const model = require("../../routes/blog-manage/models/model");
const Notebook = model.Notebook.Notebook;
const Note = model.Note.Note;
const NoteUser = model.User.User;

// errcode:
// 999: 操作数据库失败
// 993: 用户不存在
// 992: 密码错误

// 用户登录
module.exports = {
  // 用户登录
  login(req, res) {
    console.log("用户登录");
    let { username } = req.body;
    NoteUser.find({ username: username }, function(err, data) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询用户信息失败!"
        });
      }
      if (data.length > 0) {
        const md5 = crypto.createHash("md5");
        if (data[0].password === md5.update(req.body.password).digest("hex")) {
          req.session.userInfo = {
            username: username
          };
          return res.send({
            errcode: 0,
            message: "登录成功!"
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
  },

  // 用户注销
  logon(NoteUser, req, res) {
    NoteUser.find({ username: req.body.username }, function(err, data) {
      if (err) return console.log(err);
      if (data.length > 0) {
        // console.log('注销-Session');
        // console.log(req.sessionID)
        // 删除session
        delete req.session[req.sessionID];
        res.cookie("sessionId", "", { expires: 0, httpOnly: true });
        res.send({
          errcode: 0,
          message: "注销成功!"
        });
      }
    });
  },

  // 用户注册
  register(NoteUser, Notebook, req, res) {
    NoteUser.find({ username: req.body.username }, function(err, data) {
      if (err) return console.log(err);
      if (data.length > 0) {
        res.send({
          errcode: 1,
          message: "用户已注册!"
        });
        return;
      }
      const md5 = crypto.createHash("md5");
      const user = new NoteUser({
        username: req.body.username,
        password: md5.update(req.body.password).digest("hex")
      });
      user.save(function(err2, users) {
        if (err) return console.log(err);
        const notebook = new Notebook({
          notebookCode: Number(
            `${Date.now()}${Math.floor(Math.random() * 1000)}`
          ),
          notebookName: "笔记本",
          PARENT_CODE: -1,
          noteNum: 0,
          createTime: Date.now(),
          username: req.body.username,
          flag: "notebook",
          nodeClass: 1
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
  }
};

module.exports = {
  // 用户登录
  userLogin (User, res, req) {
    let account = req.body.account;
    let password = req.body.password;
    User.find({account: account, }, function (err, data) {
      if (err) return console.log(err);
      if (!data.length) {
        return res.send({
          errcode: 1,
          message: '此用户不存在!'
        });
      } else {
        if (data[0].password === password) {
          res.cookie('account', account);
          return res.send({
            errcode: 0,
            message: '欢迎来到德莱联盟!',
            ...data[0]._doc
          });
        } else {
          return res.send({
            errcode: 2,
            message: '密码错误!'
          });
        }
      }
    });
  },

  // 用户注册
  userRegister (User, req, res) {
    let user = new User({
      account: req.body.account,
      password: req.body.password,
      email: req.body.email,
      phone: req.body.phone,
      username: req.body.username
    });
    User.find({account: user.account}, function (err, data) {
      if (err) return console.log(err);
      if (!data.length) {
        user.save(function (err, res2) {
          if (err) return console.log(err);
          return res.send({ errcode: 0, message: '注册成功!' });
        })
      } else {
        return res.send({ errcode: 1, message: '用户已注册!' });
      }
    });
  },

  // 获取用户信息
  getUserInfo (User, Hero, req, res) {
    console.log(req)
    User.find({ account:  req.params['0'] }, function (err, data) {
      if (err) return console.log(err);
      Hero.find({ account: req.params['0'] }, function (err2, data2) {
        if (err) return console.log(err);
        res.send({
          errcode: 0,
          message: '获取用户信息成功!',
          userinfo: {
            ...data[0]._doc
          },
          heroArr: data2.length ? data2 : []
        });
      })
    })
  }
}
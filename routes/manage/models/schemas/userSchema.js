const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  account: String, // 账户
  password: String, // 密码
  username: String, // 昵称
  age: Number, // 年龄
  sex: String, // 性别
  email: String, // 邮箱
  phone: String, // 电话
  avatar: String // 头像
}, {collection: 'user_list'});

// export default userSchema;
exports.User = mongoose.model('user_list', userSchema)
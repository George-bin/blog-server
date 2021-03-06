const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  title: String, // 笔记标题
  content: String, // 笔记内容
  status: Number, // 笔记状态 1：正常 2：进入回收站
  createTime: Number, // 创建时间
  updateTime: Number, // 更新时间
  label: Array, // 关联标签
  type: String, // 文章类型 draft：草稿 main：正文
  account: String, // 关联账户
  notebookId: String, // 笔记本id
  introduction: String, // 简介
  img: String // 图片地址
}, { collection: 'note' });
//这里mongoose.Schema要写上第二个参数，明确指定到数据库中的哪个表取数据

// 把schema编译成一个model，model是我们构造document的Class；
exports.Note = mongoose.model('note', eventSchema)

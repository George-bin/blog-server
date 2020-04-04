const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  title: String, // 笔记标题
  content: String, // 笔记内容
  status: Number, // 笔记状态 0：未完成 1：已完成 2：进入回收站
  createTime: Number, // 创建时间
  updateTime: Number, // 更新时间
  label: String, // 关联标签
  account: String, // 关联账户
  notebookId: String // 笔记本id
}, { collection: 'note' });
//这里mongoose.Schema要写上第二个参数，明确指定到数据库中的哪个表取数据

// 把schema编译成一个model，model是我们构造document的Class；
exports.Note = mongoose.model('note', eventSchema)

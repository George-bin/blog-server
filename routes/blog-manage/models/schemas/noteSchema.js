const mongoose = require('mongoose');

const eventSchema = mongoose.Schema({
  noteName: String, // 笔记名称
  noteContent: String, // 笔记内容
  username: String, // 用户名
  createTime: Number, // 笔记更新时间
  createDate: Number, // 笔记创建日期
  noteLabel: String, // 笔记标签
  status: Number, // 笔记状态 0：未完成 1：已完成 2：进入回收站 3：需要今日完成
  notebookCode: String, // 笔记本code
  notebookName: String, // 笔记本名称
  flag: String // 标识笔记
}, { collection: 'note' });
//这里mongoose.Schema要写上第二个参数，明确指定到数据库中的哪个表取数据

// 把schema编译成一个model，model是我们构造document的Class；
exports.Note = mongoose.model('note', eventSchema)

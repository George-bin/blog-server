const mongoose = require('mongoose');

// 定义模板（表结构）
const notebookSchema = new mongoose.Schema({
  name: String, // 笔记本名称
  account: String, // 所属用户
  createTime: Number, // 创建时间
  updateTime: Number, // 更新时间
  PARENT_CODE: String, // 父级节点的code
  grade: Number // 节点等级
}, { collection: 'notebook' });
//这里mongoose.Schema要写上第二个参数，明确指定到数据库中的哪个表取数据

// 把schema编译成一个model，model是我们构造document的Class；
exports.Notebook = mongoose.model('notebook', notebookSchema)

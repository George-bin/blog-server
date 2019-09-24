// 引入express模块
const express = require("express");
//定义路由级中间件
const router = express.Router();
//引入数据模型模块
const model = require("./models/model.js");
// const AdminEvent = model.Event.Event;
const Notebook = model.Notebook.Notebook;
const Note = model.Note.Note;
const NoteUser = model.User.User;
const noteBookHelp = require("../../utils/blog-manage/notebook-help.js");
const userHelp = require("../../utils/blog-manage/notebook-user-help.js");

// 用户登录
router.post("/login", function(req, res, next) {
  userHelp.login(req, res);
});

// 用户注销
router.post("/logon", function(req, res, next) {
  userHelp.logon(NoteUser, req, res);
});

// 用户注册
router.post("/register", function(req, res, next) {
  console.log(Notebook);
  userHelp.register(NoteUser, Notebook, req, res);
});

// 获取笔记本结构树
router.get("/getNotebookTree", function(req, res, next) {
  noteBookHelp.getNotebookTree(req, res);
});

// 获取回收站笔记数量
router.get("/getRecycleBinNoteNum", function(req, res, next) {
  noteBookHelp.getRecycleBinNoteNum(req, res);
});

// 新建笔记本
router.post("/createNotebook", function(req, res, next) {
  noteBookHelp.createNotebook(Notebook, req, res);
});

// 更新笔记本
router.put("/updateNotebook/*", function(req, res, next) {
  noteBookHelp.updateNotebook(Notebook, req, res);
});

// 删除笔记本
router.post("/deleteNotebook", function(req, res, next) {
  noteBookHelp.deleteNotebook(Notebook, req, res);
});

// 新建笔记
router.post("/createNote", function(req, res, next) {
  noteBookHelp.createNote(req, res);
});

// 删除笔记
router.put("/deleteNote/*", function(req, res, next) {
  noteBookHelp.deleteNote(req, res);
});

// 还原笔记
router.put("/restoreNote/*", function(req, res, next) {
  noteBookHelp.restoreNote(req, res);
});

// 获取当前笔记本笔记
router.get("/getNoteListByClassify", function(req, res, next) {
  noteBookHelp.getNoteListByClassify(Note, Notebook, req, res);
});

// 获取笔记信息
router.get("/getNoteById", function(req, res, next) {
  noteBookHelp.getNoteById(req, res);
});

// 获取废纸篓中的数据
router.get("/getRecycleBinNoteList", function(req, res, next) {
  noteBookHelp.getRecycleBinNoteList(req, res);
});

// 获取某天已完成的事项数据
router.get("/getEventListToEnd", function(req, res, next) {
  noteBookHelp.getEventListToEnd(AdminEvent, req, res);
});

// 更新笔记
router.put("/updateNote/*", function(req, res, next) {
  noteBookHelp.updateNote(req, res);
});

// 永久性删除笔记
router.put("/clearNote/*", function(req, res, next) {
  noteBookHelp.clearNote(Note, req, res);
});

module.exports = router;

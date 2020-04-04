// 引入express模块
const express = require("express");
//定义路由级中间件
const router = express.Router();
//引入数据模型模块
const model = require("./models/model.js");
// const AdminEvent = model.Event.Event;

module.exports = router;

// 用户模块
require('./user.js');

// 笔记本模块
require('./notebook.js');

// 笔记模块
require('./note.js');
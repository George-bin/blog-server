const createError = require("http-errors"); // http通信错误处理
const express = require("express");
const path = require("path"); // 处理文件路径的工具
const cookieParser = require("cookie-parser"); // express中间件，用来实现cookie的解析
const bodyParser = require("body-parser");
const logger = require("morgan"); // node的http请求记录器中间件
const mongoose = require("mongoose"); // mongodb数据组件
const session = require("express-session");
const compression = require("compression"); // 启用gzip压缩
const serverConfig = require("./config");
const multer = require("multer");
const storage = multer.diskStorage({
  // destination: 'D:\\public\\uploads\\'+ new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate()
  destination:
    serverConfig.model === "production" ? "/public/uploads/" : `D:\\public`
});
// 设置保存上传文件路径
const upload = multer({ storage });

// 连接数据库（vueData为数据库的名字）
mongoose.connect("mongodb://localhost:27017/vueData");

// connect()返回一个状态待定（pending）的接连，接着加上成功提醒和失败警告；
mongoose.connection.on("error", console.error.bind(console, "数据库连接失败!"));
mongoose.connection.once("open", function() {
  console.log("数据库连接成功!");
});
mongoose.connection.on("disconnected", function() {
  console.log("数据库断开!");
});

let adminToolsRouter = require("./routes/blog-manage");
let blogRouter = require("./routes/blog");

let app = express();

// 使用session中间件
// 使用express-session中间件
app.use(
  session({
    // cookie的名字（也可以设为key）
    name: "usr",
    // 私钥（用于对sessionID的cookie进行签名）
    secret: "sysuygm",
    cookie: {
      // session的过期时间
      maxAge: 2 * 60 * 60 * 1000,
      httpOnly: false
    },
    resave: false,
    saveUninitialized: false
  })
);
// 每次请求，刷新session的过期时间
// app.use(function(req, res, next) {
//   req.session._garbage = Date();
//   req.session.touch();
//   next();
// });

app.use(bodyParser.json());

// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser("hello world"));

// 启用gzip压缩
app.use(compression());

// 上传文件
app.use(upload.any());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));

// 请求拦截
// let cors = `http://localhost:9000`;
app.all("*", (req, res, next) => {
  // let ol = cors.split(",");
  // if (ol.includes(req.headers.origin) >= 0) {
  //   // res.header("Access-Control-Allow-Origin", req.headers.origin);
  //   res.header("Access-Control-Allow-Origin", "*");
  //   res.header("Access-Control-Allow-Methods", "*");
  //   res.header("Access-Control-Allow-Headers", "Content-Type");
  //   res.header("Content-Type", "application/json;charset=utf-8");
  //   res.header("Access-Control-Allow-Credentials", true);
  // }
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Content-Type", "application/json;charset=utf-8");
  res.header("Access-Control-Allow-Credentials", true);

  // console.log(req.url);
  // 请求拦截 start
  let { userInfo } = req.session ? req.session : {};
  if (!userInfo) {
    if (
      req.url === "/api/blog-manage/login" ||
      req.url.indexOf("/api/blog/") > -1
    ) {
      next();
    } else {
      return res.send({
        errcode: 991,
        message: "服务器端session失效!"
      });
    }
  } else {
    next();
  }
  // 请求拦截 end
});

// 博客管理端
app.use("/api/blog-manage", adminToolsRouter);
// 个人博客
app.use("/api/blog", blogRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

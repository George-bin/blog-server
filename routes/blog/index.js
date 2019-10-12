const express = require("express");
const router = express.Router();
const blogHelp = require("../../utils/blog/blog-help");
const model = require("../blog-manage/models/model");
const Note = model.Note.Note;
const NoteBook = model.Notebook.Notebook;
const serverConfig = require("../../config");
const fs = require("fs");

router.get("/", function(req, res, next) {
  res.send({
    errcode: 0,
    message: "测试成功!"
  });
});

// 获取侧边栏导航数据
router.get("/getAsideData", function(req, res, next) {
  blogHelp.getAsideData(req, res, NoteBook, Note);
});

// 获取某个分类的数据
router.get("/getClassifyArticle/:classifyId", function(req, res, next) {
  // console.log(req.params)
  // console.log(req.query)
  blogHelp.getClassifyArticle(req, res, Note);
});

// 获取指定日期的文章
router.get("/getAssignDateArticle/:date", function(req, res, next) {
  blogHelp.getAssignDateArticle(req, res, Note);
});

// 获取指定文章的内容
router.get("/getAssignArticle/:articleId", function(req, res, next) {
  blogHelp.getAssignArticle(req, res, Note);
});

// 获取生活笔文章
router.get("/getLifeArticleList", function(req, res, next) {
  blogHelp.getLifeArticleList(req, res);
});

// 获取所有文章
router.get("/getAllArticle", function(req, res, next) {
  Note.find({}, function(err, notes) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "查询数据库失败!"
      });
    }
    res.send({
      errcode: 0,
      message: "获取文章成功!",
      noteList: notes
    });
  });
});

// 获取所有分类
router.get("/getAllClassify", function(req, res, next) {
  NoteBook.find({}, function(err, notebooks) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "查询数据库失败!"
      });
    }
    res.send({
      errcode: 0,
      message: "获取文章成功!",
      classifyList: notebooks
    });
  });
});

// 实时搜索
router.post("/searchArticle", function(req, res, next) {
  let { keyWords } = req.body;
  if (!keyWords) {
    return res.send({
      errcode: 0,
      message: "获取搜索结果成功!",
      searchArticleList: []
    });
  }
  Note.find(
    {
      noteName: {
        $regex: new RegExp(keyWords, "g")
      }
    },
    function(err, data) {
      // console.log(data);
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!"
        });
      }
      data = JSON.parse(JSON.stringify(data));
      data.forEach(item => {
        delete item.noteContent;
      });
      console.log(data);
      res.send({
        errcode: 0,
        message: "获取搜索结果成功!",
        searchArticleList: data
      });
    }
  );
});

// 上传图片
router.post("/uploadfile", function(req, res, next) {
  console.log(req.files[0]);
  let mimetype = req.files[0].mimetype.split("/")[1];
  let filename = `${Date.now()}${parseInt(
    (Math.random() + 1) * 10000
  )}.${mimetype}`;
  let filePath =
    serverConfig.model === "production"
      ? `/home/public/uploads/images/blog/${filename}`
      : `D:/public/uploads/images/blog/${filename}`;
  // console.log(filePath)
  fs.readFile(req.files[0].path, function(err, data) {
    if (err) {
      return res.send({
        errcode: 996,
        message: "上传失败!"
      });
    } else {
      console.log("读取文件成功!");
      fs.writeFile(filePath, data, function(err) {
        console.log(`写入文件:${req.files[0].path}`);
        if (err) {
          console.log(err);
          return res.send({
            errcode: 996,
            message: "上传失败!"
          });
        }
        // 删除元文件
        fs.unlink(req.files[0].path, err => {
          if (err) {
            console.log("删除文件失败1");
            console.log(err);
          }
        });
        res.send({
          errcode: 0,
          message: "上传成功!",
          filePath: `/file/uploads/images/blog/${filename}`
          // filePath:
          //   serverConfig.model === "production"
          //     ? `http://${serverConfig.host}:${serverConfig.port}/api/book/public/uploads/images/${filename}`
          //     : `/file/uploads/images/blog/${filename}`
        });
      });
    }
  });
});

module.exports = router;

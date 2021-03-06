const express = require("express");
const router = express.Router();
const model = require("../manage/models/model");
const Note = model.Note.Note;
const NoteBook = model.Notebook.Notebook;
const serverConfig = require("../../config");
const images = require("images");
const fs = require("fs");

router.get("/", function(req, res, next) {
  res.send({
    errcode: 0,
    message: "测试成功!"
  });
});

// 获取侧边栏导航数据
router.get("/getAsideData", function(req, res, next) {
  // blogHelp.getAsideData(req, res, NoteBook, Note);
});

// 获取指定日期的文章
router.get("/getAssignDateArticle/:date", function(req, res, next) {
  // blogHelp.getAssignDateArticle(req, res, Note);
});

// 获取生活笔文章
router.get("/getLifeArticleList", function(req, res, next) {
  // blogHelp.getLifeArticleList(req, res);
});

// 文章搜索
router.get("/article/search", function(req, res, next) {
  let { keyword, page, count } = req.query;
  page = page ? Number(page) : 1;
  count = count ? Number(count) : 10;
  if (!keyword) {
    return res.send({
      errcode: 0,
      message: "查询文章成功!",
      list: []
    });
  }
  Note.find(
    {
      title: {
        $regex: new RegExp(keyword, "g")
      }
    },
    function(err, notes) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!123"
        });
      }
      notes = JSON.parse(JSON.stringify(notes));
      notes.forEach(item => {
        delete item.content;
      });
      let totals = notes.length;
      let result = notes.splice((page-1)*count, count);

      res.send({
        errcode: 0,
        message: "查询文章成功!",
        data: {
          page,
          count,
          totals,
          list: result
        }
      });
    }
  );
});

// 获取指定文章的内容
router.get("/article/:id", function(req, res, next) {
  let { id } = req.params;
  Note.findOne({ _id: id }, function(err, article) {
    if (err) {
      res.send({
        errcode: 999,
        message: "查询数据库失败!"
      });
      return
    }
    article = JSON.parse(JSON.stringify(article));
    let { notebookId } = article;
    NoteBook.findOne({ _id: notebookId }, function (err, notebook) {
      if (err) {
        res.send({
          errcode: 999,
          message: "查询数据库失败!"
        })
        return
      }
      res.send({
        errcode: 0,
        message: "获取文章成功!",
        article: {
          ...article,
          notebook
        }
      });
    })
  });
});

// 获取所有文章列表
router.get("/article", function(req, res, next) {
  let { page, count } = req.query;
  page = page ? Number(page) : 1;
  count = count ? Number(count) : 10;
  Note.find({
    status: 1,
    type: 'main'
  }, function(err, notes) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "查询数据库失败!"
      });
    }
    notes = JSON.parse(JSON.stringify(notes));
    notes.reverse();
    let totals = notes.length;
    let list = notes.splice((page-1)*count, count);
    res.send({
      errcode: 0,
      message: "获取文章成功!",
      data: {
        page,
        count,
        list,
        totals
      }
    });
  });
});

// 获取指定分类的文章
router.get("/classify/:id", function(req, res, next) {
  // console.log(req.params)
  let { id } = req.params;
  let { page, count } = req.query;
  page = page ? Number(page) : 1;
  count = count ? Number(count) : 10;
  Note.find(
    {
      notebookId: id,
      status: 1,
      type: 'main'
    },
    function(err, notes) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!"
        });
      }
      notes = JSON.parse(JSON.stringify(notes));
      notes.reverse();
      let totals = notes.length;
      let list = notes.splice((page-1)*count, count);
      list.forEach(item => {
        delete item.content;
      });
      res.send({
        errcode: 0,
        message: "获取文章列表成功!",
        data: {
          page,
          count,
          list,
          totals
        }
      });
    }
  );
});

// 获取所有分类
router.get("/classify", function(req, res, next) {
  NoteBook.find({}, function(err, notebooks) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "查询数据库失败!"
      });
    }
    Note.find({}, function(err, notes) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!"
        });
      }
      let result = [];
      let obj = {};
      notes.forEach(item => {
        if (item.status === 1 && item.type === 'main') {
          if (!obj[item.notebookId]) {
            obj[item.notebookId] = 1
          } else {
            obj[item.notebookId] += 1
          }
        }
      });
      notebooks.forEach(item => {
        item = JSON.parse(JSON.stringify(item));
        if (obj[item._id]) {
          item.count = obj[item._id];
          result.push(item);
        }
      });
      res.send({
        errcode: 0,
        message: "获取分类成功!",
        list: result
      });
    });
  });
});

// 上传图片
router.post("/uploadfile", function(req, res, next) {
  console.log(req.files[0]);
  let mimetype = req.files[0].mimetype.split("/")[1];
  let fileSize = req.files[0].size;
  let filename = `${Date.now()}${parseInt(
    (Math.random() + 1) * 10000
  )}.${mimetype}`;
  let filePath =
    serverConfig.NODE_ENV === "production"
      ? `/home/public/uploads/images/blog/${filename}`
      : (serverConfig.isMac ? `/Users/george/Desktop/uploads/images/blog/${filename}` :`D:/public/uploads/images/blog/${filename}`);
  let ezipFilePath =
      serverConfig.NODE_ENV === "production"
          ? `/home/public/uploads/images/blog/ezip_${filename}`
          : (serverConfig.isMac ? `/Users/george/Desktop/uploads/images/blog/ezip_${filename}` :`D:/public/uploads/images/blog/ezip_${filename}`);
  // console.log(filePath)
  fs.readFile(req.files[0].path, function(err, data) {
    if (err) {
      return res.send({
        errcode: 996,
        message: "上传失败!"
      });
    } else {
      console.log("读取文件成功!");
      // mac环境
      if (serverConfig.NODE_ENV !== 'production' && serverConfig.isMac) {
        fs.writeFile(`/Users/george/Desktop/uploads/images/blog/${filename}`, data, function(err) {
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
              console.log("删除源文件失败");
              console.log(err);
            }
          });
          // 图片压缩
          if (fileSize > 300000) {
            let imgWidth = images(filePath).width();
            imgWidth = imgWidth > 1920 ? 1920 : imgWidth;
            images(filePath)
              .size(imgWidth)
              .save(ezipFilePath, {
                quality: 50  //保存图片到文件,图片质量为50
              });
            // 删除元文件
            fs.unlink(filePath, err => {
              if (err) {
                console.log("删除未压缩元文件失败");
                console.log(err);
              }
            });
            res.send({
              errcode: 0,
              message: "上传成功!",
              filePath: `/file/uploads/images/blog/ezip_${filename}`
            });
          } else {
            res.send({
              errcode: 0,
              message: "上传成功!",
              filePath: `/file/uploads/images/blog/${filename}`
            });
          }
        });
      } else {
        // window and linux环境
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
              console.log("删除元文件失败");
              console.log(err);
            }
          });
          // 图片压缩
          if (fileSize > 300000) {
            let imgWidth = images(filePath).width();
            imgWidth = imgWidth > 1920 ? 1920 : imgWidth;
            images(filePath)
              .size(imgWidth)
              .save(ezipFilePath, {
                quality: 50  //保存图片到文件,图片质量为50
              });
            // 删除元文件
            fs.unlink(filePath, err => {
              if (err) {
                console.log("删除未压缩元文件失败");
                console.log(err);
              }
            });
            res.send({
              errcode: 0,
              message: "上传成功!",
              filePath: `/file/uploads/images/blog/ezip_${filename}`
            });
          } else {
            res.send({
              errcode: 0,
              message: "上传成功!",
              filePath: `/file/uploads/images/blog/${filename}`
            });
          }
        });
      }
    }
  });
});

module.exports = router;

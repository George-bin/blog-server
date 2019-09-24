const model = require("../../routes/blog-manage/models/model");
const Note = model.Note.Note;
const NoteBook = model.Notebook.Notebook;

// errcode:
// 999: 操作数据库失败
// 998: 当前分类不存在

module.exports = {
  // 获取左侧菜单栏数据
  getAsideData(req, res) {
    NoteBook.find({ nodeClass: 3 }, function(err, classifyList) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!"
        });
      }
      Note.find({}, function(err, Notes) {
        if (err) {
          return res.send({
            errcode: 999,
            message: "查询数据库失败!"
          });
        }
        let dateList = [];
        let lifeArticleList = [];
        // console.log(Notes)
        Notes.forEach(item => {
          if (!dateList.includes(item.createDate)) {
            dateList.push(item.createDate);
          }
          if (item.notebookCode === "-2" && item.status === 0)
            lifeArticleList.push(item);
        });
        // console.log(dateList)
        classifyList = classifyList.filter(item => {
          return item.noteNum > 0;
        });
        let asideNav = {
          classifyList,
          lifeArticleList,
          dateList
        };
        res.send({
          errcode: 0,
          message: "查询成功!",
          asideNav
        });
      });
    });
  },

  // 获取指定分类的文章
  getClassifyArticle(req, res) {
    // console.log(req.query)
    console.log(req.params);
    let { classifyId } = req.params;
    const { page = 1, limit = 2 } = req.query;

    NoteBook.findOne({ notebookCode: classifyId }, function(err, classify) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询分类信息失败!"
        });
      }
      if (!classify) {
        return res.send({
          errcode: 998,
          message: "当前分类不存在!"
        });
      }
      Note.find(
        { notebookCode: classifyId },
        null,
        {
          skip: (page - 1) * limit,
          limit: Number(limit)
        },
        function(err, articleList) {
          if (err) {
            return res.send({
              errcode: 999,
              message: "查询数据库失败!"
            });
          }
          // console.log(articleList)
          res.send({
            errcode: 0,
            message: "获取文章列表成功!",
            classifyInfo: {
              articleList: articleList,
              count: classify.noteNum
            }
          });
        }
      );
    });
  },

  // 获取指定日期的文章
  getAssignDateArticle(req, res) {
    // console.log('获取指定日期的文章')
    const { date } = req.params;
    const { page = 1, limit = 2 } = req.query;
    Note.find({ createDate: date, status: 0 }, function(err, data) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!"
        });
      }
      Note.find(
        { createDate: date, status: 0 },
        null,
        {
          skip: (page - 1) * limit,
          limit: Number(limit)
        },
        function(err, articleList) {
          if (err) {
            return res.send({
              errcode: 999,
              message: "查询数据库失败!"
            });
          }
          res.send({
            errcode: 0,
            message: "获取文章成功!",
            classifyInfo: {
              articleList: articleList,
              count: data.length
            }
          });
        }
      );
    });
  },

  // 获取指定文章的内容
  getAssignArticle(req, res) {
    let { articleId } = req.params;
    Note.findOne({ _id: articleId }, function(err, article) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!"
        });
      }
      res.send({
        errcode: 0,
        message: "获取文章成功!",
        article: article
      });
    });
  },

  // 获取生活随笔文章
  getLifeArticleList(req, res) {
    Note.find(
      { notebookCode: "-2", status: 0 },
      null,
      {
        limit: 10
      },
      function(err, articleList) {
        if (err) {
          return res.send({
            errcode: 999,
            message: "查询数据库失败!"
          });
        }
        let lifeArticeList = [];
        articleList.forEach(item => {
          let obj = {
            _id: item._id,
            noteName: item.noteName,
            notebookCode: item.notebookCode
          };
          lifeArticeList.push(obj);
        });
        res.send({
          errcode: 0,
          message: "获取文章成功!",
          lifeArticeList: lifeArticeList
        });
      }
    );
  }
};

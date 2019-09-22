const model = require("../../routes/blog-manage/models/model");
const Note = model.Note.Note;
const NoteBook = model.Notebook.Notebook;

// errcode:
// 999: 操作数据库失败

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
        let jottingsList = [];
        // console.log(Notes)
        Notes.forEach(item => {
          if (!dateList.includes(item.createDate)) {
            dateList.push(item.createDate);
          }
          if (item.noteLabel === "jottings") jottingsList.push(item);
        });
        // console.log(dateList)
        let asideNav = {
          classifyList,
          jottingsList,
          dateList
        };
        return res.send({
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
    // console.log(req.params)
    let { classifyId } = req.params;
    const { page = 1, limit = 2 } = req.query;

    NoteBook.findOne({ notebookCode: classifyId }, function(err, classify) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询分类信息失败!"
        });
      }
      // console.log(classify)
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
    Note.find({ createDate: date }, function(err, data) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!"
        });
      }
      Note.find(
        { createDate: date },
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
    Note.find({ _id: articleId }, function(err, articleList) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!"
        });
      }
      res.send({
        errcode: 0,
        message: "获取文章成功!",
        article: articleList[0]
      });
    });
  }
};

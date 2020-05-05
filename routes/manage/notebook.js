const router = require("./index.js");
const model = require("./models/model.js");
const Notebook = model.Notebook.Notebook;
const Note = model.Note.Note;
// const User = model.User.User;

// 获取笔记本结构树
router.get("/notebook", function(req, res, next) {
  let { userInfo } = req.session;
  // console.log(userInfo);
  let treeData = [];
  Note.find({account: userInfo.account}, function(err, noteList) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "查询所有笔记失败!"
      });
    }
    Notebook.find({account: userInfo.account}, function(err, notebookList) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "获取笔记本结构树失败!"
        });
      }
      notebookList = JSON.parse(JSON.stringify(notebookList));
      notebookList.forEach(notebook => {
        notebook.children = [];
        let total = 0;
        noteList.forEach(note => {
          if (note.notebookId === notebook._id && note.status !== 2) {
            total += 1;
          }
        });
        notebook.total = total;
      });

      // 获取顶级结构树
      let index = notebookList.findIndex(item => {
        return item.PARENT_CODE === "-1";
      });
      treeData[0] = JSON.parse(JSON.stringify(notebookList[index]));
      // 递归创建树结构（二级结构和三级结构）
      function toParse(arr) {
        arr.forEach(item => {
          let arr = notebookList.filter(i => {
            return i.PARENT_CODE === item._id;
          });
          item.children = JSON.parse(JSON.stringify(arr));
          // console.log(item.children);
          if (item.children && item.children.length) {
            toParse(item.children);
          }
        });
        return arr;
      }
      toParse(treeData);
      res.send({
        errcode: 0,
        message: "获取笔记本结构树成功!",
        tree: treeData
      });
    });
  })
});

// 获取回收站数据
router.get("/recycleBin", function(req, res, next) {
  let { userInfo } = req.session;
  Note.find({ status: 2, username: userInfo.username }, function(
    err,
    noteList
  ) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "查询数据库失败!"
      });
    }
    res.send({
      errcode: 0,
      message: "获取回收站笔记数量成功!",
      recycleBinNoteNum: noteList.length
    });
  });
});

// 获取笔记本笔记 by classify
router.get("/notelist/:notebookId", function(req, res, next) {
  let { userInfo } = req.session;
  // 所有子级的数组
  let allNotebook = [
    {
      notebookId: req.params.notebookId,
      status: 1,
      username: userInfo.username
    }
  ];
  toParse([
    {
      PARENT_CODE: req.params.notebookId,
      account: userInfo.account
    }
  ]);
  function toParse(arr) {
    Notebook.find(
      {
        $or: arr
      },
      function(err, notebookList) {
        if (err) {
          res.send({
            errcode: 999,
            message: "查询数据库失败!"
          });
          return;
        }
        if (notebookList.length) {
          console.log("啦啦啦");
          let arr = [];
          notebookList.forEach(item => {
            arr.push({
              PARENT_CODE: item._id,
              account: userInfo.account
            });
            allNotebook.push({
              notebookId: item._id,
              status: 1,
              account: userInfo.account
            });
          });
          toParse(arr);
        } else {
          console.log('查询笔记列表');
          Note.find(
            {
              $or: allNotebook
            },
            function(err, noteList) {
              res.send({
                errcode: 0,
                message: "获取笔记成功!",
                noteList: gzipData(noteList)
              });
            }
          );
        }
      }
    );
  }
  function gzipData(data) {
    let arr = [];
    data.forEach(item => {
      arr.push({
        _id: item._id,
        title: item.title,
        label: item.label,
        createTime: item.createTime,
        updateTime: item.updateTime,
        notebookId: item.notebookId,
        status: item.status,
        img: item.img,
        introduction: item.introduction,
        type: item.type
      });
    });
    arr.sort(function(a, b) {
      return b.createTime - a.createTime;
    });
    return arr;
  }
});

// 新建笔记本
router.post("/notebook", function(req, res, next) {
  let notebook = new Notebook({
    ...req.body,
    createTime: Date.now()
  });
  notebook.save(function(err, notebook) {
    if (err) {
      res.send({
        errcode: 999,
        message: "插入数据库失败!"
      });
      return;
    }
    notebook = JSON.parse(JSON.stringify(notebook));
    notebook.children = [];
    res.send({
      errcode: 0,
      message: "创建笔记本成功!",
      notebook
    });
  });
});

// 更新笔记本
router.put("/notebook", function(req, res, next) {
  let { _id, name } = req.body;
  Notebook.findOneAndUpdate(
    { _id: _id },
    { name: name },
    {
      // 返回更新后的文档
      new: true
    },
    function(err, notebook) {
      if (err) {
        res.send({
          errcode: 999,
          message: "操作数据库失败!"
        });
        return;
      }
      res.send({
        errcode: 0,
        message: "更新笔记本成功!",
        notebook
      });
    }
  );
});

// 删除笔记本
router.delete("/notebook/:_id", function(req, res, next) {
  let { _id } = req.params;
  Notebook.remove({ _id }, function(err, notebook) {
    if (err) {
      res.send({
        errcode: 0,
        message: "操作数据库失败!"
      });
      return;
    }
    res.send({
      errcode: 0,
      message: "笔记本删除成功!",
      _id: _id
    });
  });
});

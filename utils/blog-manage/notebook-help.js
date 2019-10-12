const model = require("../../routes/blog-manage/models/model");
const Notebook = model.Notebook.Notebook;
const Note = model.Note.Note;
const NoteUser = model.User.User;
// errcode:
// 999: 操作数据库失败

module.exports = {
  // 获取笔记本结构树
  getNotebookTree(req, res) {
    let { userInfo } = req.session;
    // console.log(userInfo);
    let treeData = [];
    Notebook.find({ username: userInfo.username }, function(err, tree) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "获取笔记本结构树失败!"
        });
      }
      let index = tree.findIndex(item => {
        return item.PARENT_CODE === "-1";
      });
      treeData[0] = JSON.parse(JSON.stringify(tree[index]));
      // 递归创建树结构
      function toParse(arr) {
        arr.forEach(item => {
          let arr = tree.filter(i => {
            return i.PARENT_CODE === item.notebookCode;
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
  },

  // 获取回收站笔记数量
  getRecycleBinNoteNum(req, res) {
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
  },

  // 创建笔记本
  createNotebook(Notebook, req, res) {
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
      res.send({
        errcode: 0,
        message: "创建笔记本成功!",
        notebook: notebook
      });
    });
  },

  // 更新笔记本
  updateNotebook(Notebook, req, res) {
    let { _id, notebookName } = req.body;
    Notebook.findOneAndUpdate(
      { _id: _id },
      { notebookName: notebookName },
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
          data: notebook
        });
      }
    );
  },

  // 删除笔记本
  deleteNotebook(Notebook, req, res) {
    let { _id } = req.body;
    Notebook.remove({ _id: _id }, function(err, notebook) {
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
  },

  // 创建笔记
  createNote(req, res) {
    let activeTime = new Date();
    let {
      noteName,
      noteContent,
      noteLabel,
      notebookName,
      username,
      notebookCode,
      status,
      flag,
      noteNum
    } = req.body;
    // console.log(req.body);
    let note = new Note({
      noteName,
      noteContent,
      noteLabel,
      notebookName,
      username,
      notebookCode,
      status,
      flag,
      createTime: activeTime.getTime(),
      createDate: new Date(
        `${activeTime.getFullYear()}-${activeTime.getMonth() +
          1}-${activeTime.getDate()}`
      )
    });
    note.save(function(err, note) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "插入数据库失败!"
        });
      }
      Notebook.findOneAndUpdate(
        { notebookCode: notebookCode },
        {
          noteNum: noteNum + 1
        },
        {
          new: true
        },
        (err, data) => {
          if (err) {
            return res.send({
              errcode: 999,
              message: "更新分类中笔记数量失败!"
            });
          }
          res.send({
            errcode: 0,
            message: "创建笔记成功!",
            note: note
          });
        }
      );
    });
  },

  // 获取笔记本笔记列表
  getNoteListByClassify(req, res) {
    let data = [];
    let { userInfo } = req.session;
    // 所有子级的数组
    let AllNotebook = [
      {
        notebookCode: req.query.notebookCode,
        status: 0,
        username: userInfo.username
      }
    ];
    toParse([
      {
        PARENT_CODE: req.query.notebookCode,
        username: userInfo.username
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
                PARENT_CODE: item.notebookCode,
                username: userInfo.username
              });
              AllNotebook.push({
                notebookCode: item.notebookCode,
                status: 0,
                username: userInfo.username
              });
            });
            toParse(arr);
          } else {
            console.log(123);
            Note.find(
              {
                $or: AllNotebook
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
          noteName: item.noteName,
          createDate: item.createDate,
          createTime: item.createTime,
          status: item.status
        });
      });
      arr.sort(function(a, b) {
        return b.createTime - a.createTime;
      });
      return arr;
    }
  },

  // 获取笔记信息
  getNoteById(req, res) {
    // console.log(req.query);
    let { _id } = req.query;
    Note.findOne({ _id }, function(err, note) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "查询数据库失败!"
        });
      }
      res.send({
        errcode: 0,
        message: "获取笔记成功!",
        note
      });
    });
  },

  // 更新笔记
  updateNote(req, res) {
    delete req.body.rightKeyMenu;
    let noteData = JSON.parse(JSON.stringify(req.body));
    noteData.createTime = Date.now();
    let { _id } = req.body;
    Note.findOneAndUpdate(
      { _id: _id },
      {
        ...noteData
      },
      {
        new: true
      },
      function(err, note) {
        if (err) {
          return res.send({
            errcode: 999,
            message: "更新数据库失败!"
          });
        }
        res.send({
          errcode: 0,
          message: "更新数据库成功!",
          note: note
        });
      }
    );
  },

  // 删除笔记
  deleteNote(req, res) {
    let { _id, notebookCode } = req.body;
    Note.update({ _id: _id }, { status: 2 }, function(err, data) {
      if (err) {
        res.send({
          errcode: 999,
          message: "更新数据库失败!"
        });
        return;
      }
      Notebook.findOne({ notebookCode: notebookCode }, function(err, notebook) {
        // console.log(notebook)
        if (err) {
          res.send({
            errcode: 999,
            message: "查询数据库失败!"
          });
          return console.log(err);
        }
        Notebook.update(
          { notebookCode: req.body.notebookCode },
          { noteNum: --notebook.noteNum },
          function(err, data) {
            if (err) {
              res.send({
                errcode: 999,
                message: "更新数据库失败!"
              });
              return console.log(err);
            }
            res.send({
              errcode: 0,
              message: "删除笔记成功!",
              data: {
                _id: req.body._id,
                notebookCode: req.body.notebookCode
              }
            });
          }
        );
      });
    });
  },

  // 还原笔记
  restoreNote(req, res) {
    Note.update({ _id: req.body._id }, { status: 0 }, function(err, data) {
      if (err) {
        res.send({
          errcode: 999,
          message: "更新数据库失败!"
        });
        return console.log(err);
      }
      Notebook.findOne({ notebookCode: req.body.notebookCode }, function(
        err,
        notebook
      ) {
        // console.log(notebook)
        if (err) {
          return res.send({
            errcode: 999,
            message: "查询数据库失败!"
          });
        }
        Notebook.update(
          { notebookCode: req.body.notebookCode },
          { noteNum: ++notebook.noteNum },
          function(err, data) {
            if (err) {
              return res.send({
                errcode: 999,
                message: "更新数据库失败!"
              });
            }
            res.send({
              errcode: 0,
              message: "还原笔记成功!",
              data: {
                _id: req.body._id,
                notebookCode: req.body.notebookCode
              }
            });
          }
        );
      });
    });
  },

  // 获取废纸篓中的数据
  getRecycleBinNoteList(req, res) {
    let { userInfo } = req.session;
    Note.find({ username: userInfo.username, status: 2 }, function(
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
        message: "获取废纸篓数据成功!",
        noteList: noteList
      });
    });
  },

  // 永久性删除笔记
  clearNote(Note, req, res) {
    Note.remove({ _id: req.body._id }, function(err, response) {
      if (err) {
        return res.send({
          errcode: 999,
          message: "修改数据库失败!"
        });
      }
      res.send({
        errcode: 0,
        message: "删除笔记成功!",
        _id: req.body._id
      });
    });
  }
};

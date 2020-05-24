const router = require("./index.js");
const model = require("./models/model.js");
const Notebook = model.Notebook.Notebook;
const Note = model.Note.Note;
const User = model.User.User;

// 新建笔记
router.post("/note", function(req, res, next) {
  console.log('新建笔记');
  let time = Date.now()
  let note = new Note({
    ...req.body,
    createTime: time,
    updateTime: time
  });
  note.save(function(err, note) {
    if (err) {
      return res.send({
        errcode: 999,
        message: "插入数据库失败!"
      });
    }
    res.send({
      errcode: 0,
      message: '新建笔记成功!',
      note
    });
  });
});

// 删除笔记(移入废纸篓)
router.put("/noteToTrash/:_id", function(req, res, next) {
  let { _id } = req.params;
  Note.findOneAndUpdate(
    { _id },
    { status: 2 },
    { new: true },
    function(err, note) {
      if (err) {
        res.send({
          errcode: 999,
          message: "更新数据库失败!"
        });
        return;
      }
      res.send({
        errcode: 0,
        message: "删除笔记成功!",
        note
      });
    }
  );
});

// 还原笔记
router.put("/noteToNotebook/:_id", function(req, res, next) {
  let { _id } = req.params;
  Note.findOneAndUpdate(
    { _id },
    { status: 1 },
    { new: true },
    function(err, note) {
      if (err) {
        res.send({
          errcode: 999,
          message: "更新数据库失败!"
        });
        return console.log(err);
      }
      res.send({
        errcode: 0,
        message: "还原笔记成功!",
        note
      });
    }
  );
});

// 获取笔记信息
router.get("/note/:id", function(req, res, next) {
  let { id } = req.params;
  Note.findOne({ _id: id }, function(err, note) {
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
});

// 获取废纸篓中的数据
router.get("/trash", function(req, res, next) {
  let { userInfo } = req.session;
  Note.find({ account: userInfo.account, status: 2 }, function(
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
});

// 更新笔记内容
router.put("/note", function(req, res, next) {
  let noteData = JSON.parse(JSON.stringify(req.body));
  noteData.updateTime = Date.now();
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
});

// 永久性删除笔记
router.delete("/note/:_id", function(req, res, next) {
  let { _id } = req.params;
  // 直接删除笔记
  Note.remove({ _id }, function(err, response) {
    if (err) {
      console.log(err);
      return res.send({
        errcode: 999,
        message: "删除数据失败!"
      });
    }
    res.send({
      errcode: 0,
      message: "删除笔记成功!"
    });
  });
});

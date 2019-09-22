const multer = require('multer');

// 对上传文件进行配置
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 指定文件上传到服务器的路径
    cb(null, './public/images/');
  },
  // 指定上传到服务器文件的名称

  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
let upload = multer({ storage: storage });

// 将上传的文件保存在哪里
// let upload = multer({ dest: './www/upload/img/' });

exports.upload = upload;
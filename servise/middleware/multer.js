const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 确保 uploads 目录存在
const uploadDir = path.join(__dirname, '../uploads/images/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // 文件保存路径
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const filename = file.originalname;
    cb(null, filename); // 设置唯一文件名
  }
});

// 创建 multer 实例
const upload = multer({ storage });

module.exports = upload;
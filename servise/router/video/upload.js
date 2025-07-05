const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");

const axios = require('axios');

const sendResponse = require("../../utils/response.js");



// 引入封装好的 upload 模块
const multer = require("../../middleware/multer");

// 添加上传接口
router.post("/uploads", multer.array("files"), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendResponse.error(res, "没有文件上传");
    }

    // 构建访问路径（如 /uploads/时间戳-随机数.扩展名）
    const filePaths = req.files.map(
      (file) => `/images/${file.filename}`
    );

    sendResponse.success(res, "上传成功", {
      url: filePaths,
    });
  } catch (err) {
    console.error("上传失败:", err);
    sendResponse.error(res, "上传失败");
  }
});

// // 添加上传单个文件接口
// router.post("/upload", multer.single("file"), (req, res) => {
//   try {
//     if (!req.file) {
//       return sendResponse.error(res, "没有文件上传");
//     }

//     // 构建访问路径
//     const filePath = `/uploads/images/${req.file.filename}`;

//     sendResponse.success(res, "上传成功", {
//       url: filePath,
//     });
//   } catch (err) {
//     console.error("上传失败:", err);
//     sendResponse.error(res, "上传失败");
//   }
// });

// 处理本地文件上传
router.post("/upload", multer.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return sendResponse.error(res, "没有文件上传");
    }

    const publicPath = `/images/${req.file.filename}`;
    sendResponse.success(res, "上传成功", { url: publicPath });
  } catch (err) {
    console.error("上传失败:", err.message || err);
    sendResponse.error(res, "上传失败");
  }
});

// 处理远程 URL 图片下载
router.post("/upload/remote", async (req, res) => {
  try {
    const { imageUrl, filename } = req.body;

    if (!imageUrl) {
      return sendResponse.error(res, "缺少图片链接");
    }

    const uploadDir = path.join(__dirname, '../../uploads/images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const finalFilename = filename || path.basename(imageUrl);
    const filePath = path.join(uploadDir, finalFilename);
    const publicPath = `/images/${finalFilename}`;

    const writer = fs.createWriteStream(filePath);

    const response = await axios.get(imageUrl, {
      responseType: 'stream',
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (response.status !== 200) {
      throw new Error(`远程图片下载失败，HTTP状态码: ${response.status}`);
    }

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    sendResponse.success(res, "操作成功", { url: publicPath });
  } catch (err) {
    console.error("上传失败:", err.message || err);
    sendResponse.error(res, "上传失败");
  }
});


module.exports = router;

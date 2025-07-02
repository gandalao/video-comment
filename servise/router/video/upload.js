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
      (file) => `/uploads/images/${file.filename}`
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

// 添加或修改 upload 接口以支持 imageUrl 下载
router.post("/upload", multer.single("file"), async (req, res) => {
  try {
    const { imageUrl } = req.body;

    let filePath = '';
    let publicPath = '';

    if (imageUrl) {
      // 下载远程图片
      const response = await axios.get(imageUrl, { responseType: 'stream' });
      const filename = path.basename(imageUrl);
      filePath = path.join(__dirname, '../../uploads/images', filename);
      publicPath = `/uploads/images/${filename}`;

      const writer = fs.createWriteStream(filePath);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } else if (req.file) {
      // 使用上传的文件
      filePath = `/uploads/images/${req.file.filename}`;
      publicPath = filePath;
    } else {
      return sendResponse.error(res, "没有文件上传或提供图片链接");
    }

    sendResponse.success(res, "操作成功", {
      url: publicPath,
    });
  } catch (err) {
    sendResponse.error(res, "上传失败");
  }
});



module.exports = router;

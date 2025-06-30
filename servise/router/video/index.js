const express = require("express");
const router = express.Router();
const db = require("../../middleware/mysql.js"); // 引入数据库模块

const sendResponse = require("../../utils/response.js");

router.post("/list", async (req, res) => {
  const { videoName, page = 1, pageSize = 10 } = req.body;

  try {
    // 构建查询语句
    let sql = `SELECT * FROM d_video`;
    let countSql = `SELECT COUNT(*) AS total FROM d_video`;
    const params = [];

    if (videoName) {
      sql += ` WHERE videoName LIKE ?`;
      countSql += ` WHERE videoName LIKE ?`;
      params.push(`%${videoName}%`);
    }

    // 添加分页
    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(pageSize), (parseInt(page) - 1) * parseInt(pageSize));

    // 执行查询
    const [results, countResult] = await Promise.all([
      db.query(sql, params),
      db.query(countSql, params.slice(0, 1)), // 分页参数不影响总数查询
    ]);

    const total = countResult[0].total;

    sendResponse.success(res, "获取视频列表成功", {
      list: results,
      total,
    });
  } catch (err) {
    console.error("查询失败:", err);
    sendResponse.error(res, "服务器内部错误");
  }
});

router.post("/add", async (req, res) => {
  const { videoName, actor, shortDesc, coverUrl, category, releaseDate } =
    req.body;

  // 参数校验（基础检查）
  if (!videoName || !actor) {
    return sendResponse.error(res, "缺少必填参数");
  }

  try {
    const sql = `
      INSERT INTO d_video (
        videoName, actor, shortDesc, coverUrl, category, releaseDate
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

    // 如果 releaseDate 为空，则插入 null
    const values = [
      videoName,
      actor,
      shortDesc || null,
      coverUrl || null,
      category || null,
      releaseDate ? new Date(releaseDate) : null,
    ];

    const result = await db.query(sql, values);
    sendResponse.success(res, "视频添加成功", result);
  } catch (err) {
    sendResponse.error(res, "服务器内部错误");
  }
});

// 引入封装好的 upload 模块
const multer = require("../../middleware/multer");
// 添加上传接口
router.post("/upload", multer.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return sendResponse.error(res, "没有文件上传");
    }

    // 构建访问路径（如 /uploads/时间戳-随机数.扩展名）
    const filePath = `/uploads/${req.file.filename}`;

    sendResponse.success(res, "上传成功", {
      url: filePath,
    });
  } catch (err) {
    console.error("上传失败:", err);
    sendResponse.error(res, "上传失败");
  }
});

module.exports = router;

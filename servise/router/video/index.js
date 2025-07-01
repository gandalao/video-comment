const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const db = require("../../middleware/mysql.js"); // 引入数据库模块

const sendResponse = require("../../utils/response.js");
const { v4: uuidv4 } = require("uuid");

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

    // 格式化 releaseDate 字段为 YYYY-MM-DD
    const formattedResults = results.map((video) => {
      if (video.releaseDate) {
        const date = new Date(video.releaseDate);
        video.releaseDate = date.toISOString().split("T")[0]; // 转换为 YYYY-MM-DD
      }
      return video;
    });

    sendResponse.success(res, "获取视频列表成功", {
      list: formattedResults,
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
        id, videoName, actor, shortDesc, coverUrl, category, releaseDate
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    // 如果 releaseDate 为空，则插入 null
    const values = [
      uuidv4(),
      videoName,
      actor,
      shortDesc || null,
      coverUrl || null,
      category || null,
      releaseDate ? releaseDate : null,
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
router.post("/upload", multer.array("files"), (req, res) => {
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

// 编辑视频接口
router.post("/edit", async (req, res) => {
  const { id, videoName, actor, shortDesc, coverUrl, category, releaseDate } =
    req.body;

  // 参数校验
  if (!id || !videoName || !actor) {
    return sendResponse.error(res, "缺少必要参数");
  }

  try {
    // 构建更新字段
    const updateFields = [];
    const values = [];

    if (videoName) {
      updateFields.push("videoName = ?");
      values.push(videoName);
    }
    if (actor) {
      updateFields.push("actor = ?");
      values.push(actor);
    }
    if (shortDesc !== undefined) {
      updateFields.push("shortDesc = ?");
      values.push(shortDesc || null);
    }
    if (coverUrl !== undefined) {
      updateFields.push("coverUrl = ?");
      values.push(coverUrl || null);
    }
    if (category !== undefined) {
      updateFields.push("category = ?");
      values.push(category || null);
    }
    if (releaseDate !== undefined) {
      updateFields.push("releaseDate = ?");
      values.push(releaseDate ? releaseDate : null);
    }
    // 添加更新时间
    updateFields.push("updateTime = NOW()");
    // 构建 SQL 语句
    const sql = `
      UPDATE d_video 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;
    values.push(id);

    // 执行更新操作
    const result = await db.query(sql, values);

    // 检查是否成功更新记录
    if (result.affectedRows === 0) {
      return sendResponse.error(res, "未找到要更新的视频");
    }

    sendResponse.success(res, "视频更新成功", {
      id: parseInt(id),
    });
  } catch (err) {
    console.error("视频更新失败:", err);
    sendResponse.error(res, "服务器内部错误");
  }
});

// 删除视频接口
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  // 参数校验
  if (!id) {
    return sendResponse.error(res, "缺少必要参数: id");
  }

  try {
    // 构建 SQL 语句
    const sql = `DELETE FROM d_video WHERE id = ?`;

    // 执行删除操作
    const result = await db.query(sql, [id]);

    // 检查是否成功删除记录
    if (result.affectedRows === 0) {
      return sendResponse.error(res, "未找到要删除的视频");
    }

    sendResponse.success(res, "视频删除成功", {
      id: parseInt(id),
    });
  } catch (err) {
    console.error("视频删除失败:", err);
    sendResponse.error(res, "服务器内部错误");
  }
});

// 添加批量删除接口
router.post("/batchDelete", async (req, res) => {
  const { ids } = req.body;

  // 参数校验
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return sendResponse.error(res, "缺少必要参数: ids");
  }

  try {
    // 构建 SQL 语句
    const sql = `DELETE FROM d_video WHERE id IN (${ids
      .map(() => "?")
      .join(",")})`;

    // 执行删除操作
    const result = await db.query(sql, ids);

    // 检查是否成功删除记录
    if (result.affectedRows === 0) {
      return sendResponse.error(res, "未找到要删除的视频");
    }

    sendResponse.success(res, "视频批量删除成功", {
      count: result.affectedRows,
    });
  } catch (err) {
    console.error("视频批量删除失败:", err);
    sendResponse.error(res, "服务器内部错误");
  }
});

module.exports = router;

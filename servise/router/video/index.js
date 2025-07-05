const express = require("express");
const router = express.Router();

const db = require("../../middleware/mysql.js"); // 引入数据库模块

const sendResponse = require("../../utils/response.js");
const { v4: uuidv4 } = require("uuid");

router.post("/list", async (req, res) => {
  const {
    videoName,
    actor,
    videoType,
    resolution,
    subtitle,
    page = 1,
    pageSize = 10,
    sortReleaseDate = "desc",
  } = req.body || {};

  try {
    // 参数校验
    const pageNum = parseInt(page, 10);
    const pageSizeNum = parseInt(pageSize, 10);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(pageSizeNum) || pageSizeNum < 1) {
      return sendResponse.error(res, "分页参数非法");
    }

    const order = sortReleaseDate.toLowerCase() === "desc" ? "DESC" : "ASC";

    // 构建查询语句
    const sqlParts = [`SELECT * FROM d_video`];
    const countSqlParts = [`SELECT COUNT(*) AS total FROM d_video`];
    const params = [];

    let whereClauses = [];
    if (videoName) {
      whereClauses.push(`videoName LIKE ?`);
      params.push(`%${videoName}%`);
    }
    if (actor) {
      whereClauses.push(`actor LIKE ?`);
      params.push(`%${actor}%`);
    }
    if (videoType) {
      whereClauses.push(`videoType = ?`);
      params.push(videoType);
    }
    if (resolution) {
      whereClauses.push(`resolution = ?`);
      params.push(resolution);
    }
    if (subtitle) {
      whereClauses.push(`subtitle = ?`);
      params.push(subtitle);
    }

    if (whereClauses.length > 0) {
      sqlParts.push(`WHERE ${whereClauses.join(" AND ")}`);
      countSqlParts.push(`WHERE ${whereClauses.join(" AND ")}`);
    }

    // 排序
    sqlParts.push(`ORDER BY releaseDate ${order}`);

    // 分页
    sqlParts.push(`LIMIT ? OFFSET ?`);
    params.push(pageSizeNum, (pageNum - 1) * pageSizeNum);

    const sql = sqlParts.join(" ");
    const countSql = countSqlParts.join(" ");

    // 执行查询
    const [results, countResult] = await Promise.all([
      db.query(sql, params),
      db.query(countSql, params.slice(0, whereClauses.length * 2 + 1)), // 去除分页参数
    ]);

    const total = countResult[0]?.total || 0;

    // 格式化 releaseDate 字段为 YYYY-MM-DD
    const formattedResults = results.map((video) => {
      if (video.releaseDate) {
        const date = new Date(video.releaseDate);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          video.releaseDate = `${year}-${month}-${day}`;
        }
      }
      return video;
    });

    sendResponse.success(res, "获取视频列表成功", {
      list: formattedResults,
      total,
    });
  } catch (err) {
    console.error("查询失败:", err, {
      sql: sql,
      params: params,
    });
    sendResponse.error(res, "服务器内部错误");
  }
});

router.post("/add", async (req, res) => {
  const {
    videoName,
    actor,
    shortDesc,
    coverUrl,
    category,
    releaseDate,
    series,
    subtitle,
    resolution,
    videoType,
  } = req.body;

  // 参数校验（基础检查）
  if (!videoName || !actor) {
    return sendResponse.error(res, "缺少必填参数");
  }

  try {
    // 检查 videoName 是否已存在
    const existingVideo = await db.query('SELECT * FROM d_video WHERE videoName = ?', [videoName]);
    if (existingVideo.length > 0) {
      return sendResponse.error(res, "视频名称[" + videoName + "]已存在");
    }

    const sql = `
      INSERT INTO d_video (
        id, videoName, actor, shortDesc, coverUrl, category, releaseDate,series,subtitle,resolution,videoType
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      series || null,
      subtitle || null,
      resolution || null,
      videoType || null,
    ];

    const result = await db.query(sql, values);
    sendResponse.success(res, "视频添加成功", result);
  } catch (err) {
    sendResponse.error(res, "服务器内部错误");
  }
});

// 编辑接口
router.post("/edit", async (req, res) => {
  const {
    id,
    videoName,
    actor,
    shortDesc,
    coverUrl,
    category,
    releaseDate,
    series,
    subtitle,
    resolution,
    videoType,
  } = req.body;

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
    if (series !== undefined) {
      updateFields.push("series = ?");
      values.push(series || null);
    }
    if (subtitle !== undefined) {
      updateFields.push("subtitle = ?");
      values.push(subtitle || null);
    }
    if (resolution !== undefined) {
      updateFields.push("resolution = ?");
      values.push(resolution || null);
    }
    if (videoType !== undefined) {
      updateFields.push("videoType = ?");
      values.push(videoType || null);
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

// 删除接口
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

// 批量删除接口
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

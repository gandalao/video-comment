const express = require("express");
const router = express.Router();

const db = require("../../middleware/mysql.js"); // 引入数据库模块

const sendResponse = require("../../utils/response.js");
const { v4: uuidv4 } = require("uuid");

router.post("/list", async (req, res) => {
  const { actorName, page = 1, pageSize = 10 } = req.body || {};

  try {
    // 构建查询语句
    let sql = `SELECT * FROM d_actor`;
    let countSql = `SELECT COUNT(*) AS total FROM d_actor`;
    const params = [];

    if (actorName) {
      sql += ` WHERE actorName LIKE ?`;
      countSql += ` WHERE actorName LIKE ?`;
      params.push(`%${actorName}%`);
    }

    // 判断是否传入分页参数
    if (page && pageSize) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(
        parseInt(pageSize),
        (parseInt(page) - 1) * parseInt(pageSize)
      );
    }

    // 执行查询
    const [results, countResult] = await Promise.all([
      db.query(sql, params),
      db.query(countSql, params.slice(0, 1)), // 分页参数不影响总数查询
    ]);

    const total = countResult[0].total || 0;

    // 格式化 releaseDate 字段为 YYYY-MM-DD
    const formattedResults = results.map((actor) => {
      if (actor.birthday) {
        const date = new Date(actor.birthday);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从0开始
        const day = String(date.getDate()).padStart(2, "0");

        actor.birthday = `${year}-${month}-${day}`;
      }
      return actor;
    });

    sendResponse.success(res, "获取演员列表成功", {
      list: formattedResults,
      total,
    });
  } catch (err) {
    console.error("查询失败:", err);
    sendResponse.error(res, "服务器内部错误");
  }
});

router.post("/add", async (req, res) => {
  const {
    actorName,
    actorNameJp,
    gender,
    birthday,
    nationality,
    avatarUrl,
    introduce,
    height,
  } = req.body;

  // 参数校验（基础检查）
  if (!actorName) {
    return sendResponse.error(res, "缺少必填参数");
  }

  try {
    const sql = `
      INSERT INTO d_actor (
        id, actorName, actorNameJp,gender, birthday, nationality, avatarUrl, introduce,height
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // 如果 birthday 为空，则插入 null
    const values = [
      uuidv4(),
      actorName,
      actorNameJp || null,
      gender || null,
      birthday ? birthday : null,
      nationality || null,
      avatarUrl || null,
      introduce || null,
      height || null,
    ];

    const result = await db.query(sql, values);
    sendResponse.success(res, "演员添加成功", result);
  } catch (err) {
    sendResponse.error(res, "服务器内部错误");
  }
});

// 编辑接口
router.post("/edit", async (req, res) => {
  const {
    id,
    actorName,
    actorNameJp,
    gender,
    birthday,
    nationality,
    avatarUrl,
    introduce,
    height,
  } = req.body;

  // 参数校验
  if (!id || !actorName) {
    return sendResponse.error(res, "缺少必要参数");
  }

  try {
    // 构建更新字段
    const updateFields = [];
    const values = [];

    if (actorName) {
      updateFields.push("actorName = ?");
      values.push(actorName);
    }
    if (actorNameJp) {
      updateFields.push("actorNameJp = ?");
      values.push(actorNameJp);
    }
    if (gender !== undefined) {
      updateFields.push("gender = ?");
      values.push(gender || null);
    }
    if (birthday !== undefined) {
      updateFields.push("birthday = ?");
      values.push(birthday ? birthday : null);
    }
    if (nationality !== undefined) {
      updateFields.push("nationality = ?");
      values.push(nationality || null);
    }
    if (avatarUrl !== undefined) {
      updateFields.push("avatarUrl = ?");
      values.push(avatarUrl || null);
    }
    if (introduce !== undefined) {
      updateFields.push("introduce = ?");
      values.push(introduce || null);
    }
    if (height !== undefined) {
      updateFields.push("height = ?");
      values.push(height || null);
    }
    // 添加更新时间
    updateFields.push("updateTime = NOW()");
    // 构建 SQL 语句
    const sql = `
      UPDATE d_actor 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;
    values.push(id);

    // 执行更新操作
    const result = await db.query(sql, values);

    // 检查是否成功更新记录
    if (result.affectedRows === 0) {
      return sendResponse.error(res, "未找到要更新的演员");
    }

    sendResponse.success(res, "演员更新成功", {
      id: parseInt(id),
    });
  } catch (err) {
    console.error("演员更新失败:", err);
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
    const sql = `DELETE FROM d_actor WHERE id = ?`;

    // 执行删除操作
    const result = await db.query(sql, [id]);

    // 检查是否成功删除记录
    if (result.affectedRows === 0) {
      return sendResponse.error(res, "未找到要删除的演员");
    }

    sendResponse.success(res, "演员删除成功", {
      id: parseInt(id),
    });
  } catch (err) {
    console.error("演员删除失败:", err);
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
    const sql = `DELETE FROM d_actor WHERE id IN (${ids
      .map(() => "?")
      .join(",")})`;

    // 执行删除操作
    const result = await db.query(sql, ids);

    // 检查是否成功删除记录
    if (result.affectedRows === 0) {
      return sendResponse.error(res, "未找到要删除的演员");
    }

    sendResponse.success(res, "演员批量删除成功", {
      count: result.affectedRows,
    });
  } catch (err) {
    console.error("演员批量删除失败:", err);
    sendResponse.error(res, "服务器内部错误");
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const db = require("../../middleware/mysql.js"); // 引入数据库模块

const sendResponse = require("../../utils/response.js");

router.get("/getInfo", async (req, res) => {
  try {
    const results = await db.query("SELECT * from category");
    res.send({
      code: 0,
      message: "获取成功",
      data: results,
    });
  } catch (error) {
    res.status(500).send({
      code: -1,
      message: "数据库查询失败",
      error: error.message,
    });
  }
});

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return sendResponse.clientError(res, 400, "缺少必要参数");
  }

  try {
    const existingUser = await db.query(
      "SELECT * FROM d_user WHERE username = ?",
      [username]
    );
    if (existingUser.length > 0) {
      return sendResponse.error(res, "用户名已存在");
    }

    await db.query("INSERT INTO d_user (username, password) VALUES (?, ?)", [
      username,
      password,
    ]);
    return sendResponse.success(res, null, "注册成功");
  } catch (error) {
    return sendResponse.serverError(res, error);
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return sendResponse.error(res, "用户名或密码不能为空");
  }

  try {
    const user = await db.query("SELECT * FROM d_user WHERE username = ?", [
      username,
    ]);

    if (user.length === 0) {
      return sendResponse.error(res, "用户不存在");
    }

    if (user[0].password !== password) {
      return sendResponse.error(res, "密码错误");
    }

    const { id } = user[0];
    return sendResponse.success(res, "登录成功", { id, username });
  } catch (error) {
    return sendResponse.serverError(res, error);
  }
});

module.exports = router;

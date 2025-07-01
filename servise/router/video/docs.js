const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const db = require("../../middleware/mysql.js"); // 引入数据库模块

const sendResponse = require("../../utils/response.js");

router.get("/download", async (req, res) => {
  let sql = `SELECT * FROM d_video`;

  const result = await db.query(sql);

  // 检查是否查询到数据
  if (result.length === 0) {
    return sendResponse.error(res, "没有视频数据");
  }

  // 使用查询结果生成Markdown内容
  // 按照actor类型分组
  const groupedByActorType = result.reduce((acc, video) => {
    const key = video.actor || "未知类型";
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(video);
    return acc;
  }, {});

  // 生成Markdown内容
  let mdContent = "";

  for (const [actor, videos] of Object.entries(groupedByActorType)) {
    mdContent += `## ${actor}\n\n`;

    videos.forEach((video) => {
      mdContent += `### ${video.videoName}\n\n`;
      mdContent += `${video.coverUrl}\n\n`;
      mdContent += `<img src="${video.coverUrl}">\n\n\n\n`;
    });
    mdContent += "\n\n\n\n";
  }

  // 指定文件路径
  const filePath = path.join(__dirname, "output.md");

  // 写入文件
  fs.writeFile(filePath, mdContent, (err) => {
    if (err) {
      return sendResponse.error(res, "写入文件时发生错误");
    } else {
      console.log("Markdown文件已成功生成");
      // 发送文件给前端下载
      // res.download(filePath, "video-info.md", (downloadErr) => {
      //   if (downloadErr) {
      //     console.error("下载文件时发生错误", downloadErr);
      //     return res
      //       .status(500)
      //       .json({ code: 500, message: "下载文件时发生错误" });
      //   }
      // });
    }
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();

const fs = require("fs");
const path = require("path");
const db = require("../../middleware/mysql.js"); // 引入数据库模块

const sendResponse = require("../../utils/response.js");

const archiver = require("archiver"); // 新增：用于打包下载

router.get("/generate-doc", async (req, res) => {
  try {
    await generateAndWriteDoc(db, res);
    return sendResponse.success(res, "文档已生成");
  } catch (err) {
    return sendResponse.error(res, err.message || "生成文档失败");
  }
});

// 新增：独立生成文档的方法
async function generateAndWriteDoc(db, res) {
  let sql = `SELECT * FROM d_video`;
  const result = await db.query(sql);

  if (result.length === 0) {
    throw new Error("没有视频数据");
  }

  // 查询演员信息...
  const actorSql = `SELECT actorName,actorNameJp, birthday ,height FROM d_actor`;
  const actors = await db.query(actorSql);
  const actorMap = new Map();
  actors.forEach((actor) => {
    actorMap.set(actor.actorName, actor);
  });

  // 分组处理...
  const groupedByActorType = result.reduce((acc, video) => {
    const actorNames = (video.actor || "").split("、").map((a) => a.trim());

    if (actorNames.length === 0 || !video.actor) {
      if (!acc["未知类型"]) acc["未知类型"] = [];
      acc["未知类型"].push(video);
      return acc;
    }

    if (actorNames.length > 1) {
      if (!acc["多人合作"]) acc["多人合作"] = [];
      acc["多人合作"].push(video);
      return acc;
    }

    const actorName = actorNames[0];
    const actorInfo = actorMap.get(actorName);
    const key = actorInfo ? actorName : "未知类型";

    if (!acc[key]) acc[key] = [];
    acc[key].push(video);

    return acc;
  }, {});

  const sortedGroupedResult = {};
  const unknownGroup = groupedByActorType["未知类型"] || [];
  const multiGroup = groupedByActorType["多人合作"] || [];

  delete groupedByActorType["未知类型"];
  delete groupedByActorType["多人合作"];

  const sortedActors = Object.entries(groupedByActorType).sort((a, b) => {
    const aBirthday = new Date(actorMap.get(a[0])?.birthday || "");
    const bBirthday = new Date(actorMap.get(b[0])?.birthday || "");
    return bBirthday - aBirthday;
  });

  for (const [actor, videos] of sortedActors) {
    sortedGroupedResult[actor] = videos;
  }

  if (multiGroup.length > 0) {
    sortedGroupedResult["多人合作"] = multiGroup;
  }

  if (unknownGroup.length > 0) {
    sortedGroupedResult["未知类型"] = unknownGroup;
  }

  // 生成 Markdown 内容
  const mdContent = await generateMarkdownContent(
    db,
    actorMap,
    sortedGroupedResult
  );

  // 写入文件
  const filePath = path.join(__dirname, "../../uploads/output.md");
  await new Promise((resolve, reject) => {
    fs.writeFile(filePath, mdContent, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  return filePath; // 返回文件路径供后续使用
}
// 新增：抽离生成 Markdown 内容的方法
async function generateMarkdownContent(db, actorMap, sortedGroupedResult) {
  let mdContent = "# 视频信息\n\n";

  for (const [actor, videos] of Object.entries(sortedGroupedResult)) {
    // 👇 新增：按 releaseDate 降序排序
    const sortedVideos = [...videos].sort((a, b) => {
      const dateA = new Date(b.releaseDate || "");
      const dateB = new Date(a.releaseDate || "");
      return dateA - dateB;
    });

    const actorInfo = actorMap.get(actor) || {};
    const actorNameJp = actorInfo.actorNameJp
      ? `日语：${actorInfo.actorNameJp} `
      : "";
    const birthday = actorInfo.birthday ? actorInfo.birthday : "";
    const height = actorInfo.height ? `身高：${actorInfo.height}cm` : ""; // 新增：处理身高字段

    // 👇 格式化生日为 "YY年"
    let formattedBirthday = "";
    if (birthday) {
      const birthDate = new Date(birthday);
      if (!isNaN(birthDate)) {
        const year = birthDate.getFullYear();
        formattedBirthday = `${String(year).slice(-2)}年`;
      }
    }

    // 👇 构建演员标题
    let actorTitle = `## ${actor}`;
    if (formattedBirthday) {
      actorTitle += `  | ${formattedBirthday}`;
    }

    // 拼接演员信息行（日语名 + 生日 + 身高）
    const infoLine = [actorNameJp, birthday && `生日：${birthday}`, height]
      .filter(Boolean)
      .join("  ");

    mdContent += `------\n${actorTitle}\n`;
    if (infoLine) {
      mdContent += `${infoLine}\n\n`;
    }

    // 👇 使用排序后的 videos
    sortedVideos.forEach((video) => {
      let title = `### ${video.videoName}`;
      // 如果是“多人合作”，则添加是几人共演
      if (actor === "多人合作" && video.actor) {
        title += `    ${video.actor.split("、").length}人合作`;
      } else if (actor === "未知类型" && video.actor) {
        title += `    ${video.actor}`;
      }

      if (video.resolution != "1080p") {
        title += `  (${video.resolution})`;
      }
      if (video.videoType != "有码") {
        title += `  (${video.videoType})`;
      }
      if (video.subtitle != "外挂字幕") {
        title += `  (${video.subtitle})`;
      }
      
      mdContent += `${title}\n\n`;

      // 👇 如果是“多人合作”，则在下一行添加共演信息
      if (actor === "多人合作" && video.actor) {
        mdContent += `共演：${video.actor}\n\n`;
      }

      // 格式化 releaseDate 显示为 YYYY-MM-DD
      let formattedReleaseDate = "";
      if (video.releaseDate) {
        const date = new Date(video.releaseDate);
        if (!isNaN(date)) {
          formattedReleaseDate = `发行日期：${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        }
      }

      if (formattedReleaseDate) {
        mdContent += `${formattedReleaseDate}\n\n`;
      }

      mdContent += `${video.shortDesc}\n`;
      mdContent += `<img src=".${video.coverUrl}" width="800px" height="auto" />\n\n\n\n\n\n\n\n`;
    });
    mdContent += "\n\n\n\n\n\n\n\n\n\n\n";
  }

  return mdContent;
}

router.get("/download", async (req, res) => {
  // 👇 先执行生成文档逻辑
  await generateAndWriteDoc(db, res);

  const uploadsDir = path.join(__dirname, "../../uploads/");
  const zipFilePath = path.join(uploadsDir, "../videoDoc.zip");

  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver("zip", {
    zlib: { level: 9 }, // 设置压缩等级
  });

  output.on("close", function () {
    // 文件打包完成后发送给前端下载
    res.header("Content-Type", "application/zip");
    res.header("Content-Disposition", `attachment; filename=videoDoc.zip`);

    const zipReadStream = fs.createReadStream(zipFilePath);
    zipReadStream.pipe(res);

    // 可选：删除临时 zip 文件
    zipReadStream.on("end", () => {
      fs.unlink(zipFilePath, (err) => {
        if (err) console.error("删除 zip 文件失败:", err);
      });
    });
  });

  archive.on("error", function (err) {
    return sendResponse.error(res, "打包失败：" + err.message);
  });

  archive.pipe(output);

  // 添加 uploads 目录下的所有文件到 zip 中
  archive.directory(uploadsDir, false); // 第二个参数为 true 表示加目录前缀
  archive.finalize();
});

// 新增接口：仅下载 output.md 文件
router.get("/download-doc", async (req, res) => {
  try {
    // 👇 先生成或更新一次文档
    const filePath = await generateAndWriteDoc(db, res);

    // 👇 设置响应头，触发浏览器下载
    res.header("Content-Type", "text/markdown; charset=utf-8");
    res.header("Content-Disposition", `attachment; filename=output.md`);

    // 👇 创建文件读取流并返回给前端
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  } catch (err) {
    return sendResponse.error(res, "下载文档失败：" + err.message);
  }
});

module.exports = router;

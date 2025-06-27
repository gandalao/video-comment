const db = require("../middleware/mysql");

const tables = {
  video: `
    CREATE TABLE IF NOT EXISTS d_video (
      id INT AUTO_INCREMENT PRIMARY KEY,
      videoName VARCHAR(255) NOT NULL COMMENT '视频名',
      shortDesc VARCHAR(255) NOT NULL COMMENT '简介',
      fullDesc TEXT  COMMENT '详细介绍',
      coverUrl VARCHAR(255)  COMMENT '封面地址',
      category VARCHAR(255)  COMMENT '分类',
      actor VARCHAR(255)  COMMENT '主演',
      releaseDate  DATE  COMMENT '上线日期',
      videoUrl VARCHAR(255)  COMMENT '视频地址',
      remark VARCHAR(255) COMMENT '备注',
      createtime TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间'
    )
  `,
};

async function initializeTables() {
  try {
    for (const [name, sql] of Object.entries(tables)) {
      await db.query(sql);
      console.log(`表 ${name} 初始化完成`);
    }
  } catch (err) {
    console.error("建表失败:", err);
  }
}

module.exports = { initializeTables };

const db = require("../middleware/mysql");

const tables = {
  video: `
    CREATE TABLE IF NOT EXISTS d_video (
      id VARCHAR(255) PRIMARY KEY COMMENT '序号',
      videoName VARCHAR(255) NOT NULL COMMENT '名称',
      actor VARCHAR(255)  COMMENT '主演',
      shortDesc VARCHAR(255)  COMMENT '简介',
      coverUrl VARCHAR(255)  COMMENT '封面',
      releaseDate  DATE  COMMENT '上映时间',
      category VARCHAR(255)  COMMENT '分类',
      series VARCHAR(255)  COMMENT '系列',
      status VARCHAR(255)  COMMENT '状态',
      length INT  COMMENT '时长',
      fullDesc TEXT  COMMENT '详细介绍',
      director VARCHAR(255)  COMMENT '导演',
      score DECIMAL(3,1)  COMMENT '评分',
      videoUrl VARCHAR(255)  COMMENT '视频地址',
      remark VARCHAR(255) COMMENT '备注',
      updateTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
      createTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间'
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

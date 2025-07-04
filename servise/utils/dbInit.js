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
      subtitle VARCHAR(255)  COMMENT '字幕',
      resolution VARCHAR(255)  COMMENT '分辨率',
      videoType VARCHAR(255)  COMMENT '类型',
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
  actor: `
    CREATE TABLE IF NOT EXISTS d_actor (
      id VARCHAR(255) PRIMARY KEY COMMENT '序号',
      actorName VARCHAR(255) NOT NULL COMMENT '姓名',
      actorNameJp VARCHAR(255)  COMMENT '日文姓名',
      actorNameEn VARCHAR(255)  COMMENT '英文名',
      birthday VARCHAR(255)  COMMENT '生日',
      age VARCHAR(255)  COMMENT '年龄',
      height VARCHAR(255)  COMMENT '身高',
      weight VARCHAR(255)  COMMENT '体重',
      occupation VARCHAR(255)  COMMENT '职业',
      birthPlace VARCHAR(255)  COMMENT '出生地',
      bloodType VARCHAR(255)  COMMENT '血型',
      hairColor VARCHAR(255)  COMMENT '发色',
      eyeColor VARCHAR(255)  COMMENT '眼色',
      gender VARCHAR(255)  COMMENT '性别',
      nationality VARCHAR(255)  COMMENT '国籍',
      avatarUrl VARCHAR(255)  COMMENT '头像',
      introduce TEXT  COMMENT '介绍',
      isTop BOOLEAN DEFAULT 0 COMMENT '是否置顶',
      topTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '置顶时间',
      cupSize VARCHAR(255)  COMMENT '罩杯大小',
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

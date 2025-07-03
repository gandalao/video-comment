// 添加全局错误处理
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 数据库配置
const mysql = require("mysql2");

class MySQLDatabase {
  constructor(config) {
    this.config = config;
    this.pool = null;
  }

  // 连接数据库
  connect() {
    return new Promise((resolve, reject) => {
      this.pool = mysql.createPool({
        ...this.config,
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
        connectTimeout: 10000,
        acquireTimeout: 10000
      });

      // 添加错误监听
      this.pool.on('error', (err) => {
        console.error('MySQL Pool Error:', err);
      });

      // 测试连接
      this.pool.query('SELECT 1', (err, results) => {
        if (err) {
          console.error("数据库连接失败:", err);
          reject(err);
          return;
        }
        console.log("数据库连接成功");
        this.startKeepAlive();
        resolve();
      });
    });
  }

  // 执行查询
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        reject(new Error("数据库未连接"));
        return;
      }

      this.pool.query(sql, params, (err, results) => {
        if (err) {
          console.error("数据库查询失败:", err);
          reject(err);
          return;
        }
        resolve(results);
      });
    });
  }

  // 关闭连接
  end() {
    return new Promise((resolve, reject) => {
      if (!this.pool) {
        reject(new Error("数据库未连接"));
        return;
      }
      this.pool.end(err => {
        if (err) {
          console.error("关闭数据库连接失败:", err);
          reject(err);
          return;
        }
        console.log("数据库连接已关闭");
        resolve();
      });
    });
  }

  // 保持连接活跃
  startKeepAlive() {
    this.keepAliveInterval = setInterval(() => {
      this.pool.query('SELECT 1');
    }, 30000);
  }
}

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "video_manager",
};



const db = new MySQLDatabase(dbConfig);
db.connect();
module.exports = db;
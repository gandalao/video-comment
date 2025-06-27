// 数据库配置
const mysql = require("mysql");

class MySQLDatabase {
  constructor(config) {
    this.config = config;
    this.connection = null;
  }

  // 连接数据库
  connect() {
    return new Promise((resolve, reject) => {
      this.connection = mysql.createConnection(this.config);
      this.connection.connect(err => {
        if (err) {
          console.error("数据库连接失败:", err);
          reject(err);
          return;
        }
        console.log("数据库连接成功");
        resolve();
      });
    });
  }

  // 执行查询
  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.query(sql, params, (err, results, fields) => {
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
      if (!this.connection) {
        reject(new Error("数据库未连接"));
        return;
      }
      this.connection.end(err => {
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
}

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "123456",
  database: "sky_take_out",
};

const db = new MySQLDatabase(dbConfig);
db.connect();
module.exports = db;
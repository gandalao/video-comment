const express = require("express")
const { initializeTables } = require('./utils/dbInit.js');
const cors = require('cors');
const path = require('path');
const app = express()

// 👇 添加这一行以启用 req.body 解析
app.use(express.json());

// 托管 uploads 文件夹为静态资源
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors()); // 允许所有来源，也可以指定 origin
// 或者更细粒度控制
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});


app.use("/", require("./router/index.js"))

initializeTables(); //自动创建所有需要的数据表

app.listen(4000, () => {
    console.log("启动后端服务，开始监听4000端口")
})
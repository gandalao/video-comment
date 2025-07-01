const express = require("express");
const router = express.Router();



router.use("/user",require("./user/index.js"))
router.use("/video",require("./video/index.js"))
router.use("/docs",require("./video/docs.js"))

router.get("/getInfo", async (req, res) => {
  res.send({
    code: 0,
    message: "获取成功aaaaaaaaa",
  });
});

module.exports = router;

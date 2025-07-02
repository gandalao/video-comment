const express = require("express");
const router = express.Router();



router.use("/user",require("./user/index.js"))

router.use("/video",require("./video/index.js"))
router.use("/video",require("./video/docs.js"))
router.use("/video",require("./video/upload.js"))

router.use("/actor",require("./video/actor.js"))

router.get("/getInfo", async (req, res) => {
  res.send({
    code: 0,
    message: "获取成功aaaaaaaaa",
  });
});

module.exports = router;

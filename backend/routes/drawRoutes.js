const express = require("express");
const router = express.Router();
const drawCtrl = require("../controllers/drawController");

router.post("/simulate", drawCtrl.executeDraw);
router.post("/publish", drawCtrl.publishDraw);

router.get("/history", drawCtrl.getDrawHistory);

module.exports = router;

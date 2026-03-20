const express = require("express");
const router = express.Router();
const drawController = require("../controllers/drawController");

// PRD: Admin controls publishing and simulations [cite: 62, 63]
router.post("/simulate", drawController.executeDraw);

module.exports = router;

const express = require("express");
const router = express.Router();
const charityController = require("../controllers/charityController");

router.get("/", charityController.getAllCharities);
router.get("/featured", charityController.getFeaturedCharities);

module.exports = router;

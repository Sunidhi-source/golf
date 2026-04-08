const express = require("express");
const router = express.Router();
const charityController = require("../controllers/charityController");

router.get("/", charityController.getAllCharities);
router.get("/featured", charityController.getFeaturedCharities);

router.post("/", charityController.createCharity);
router.put("/:charityId", charityController.updateCharity);
router.delete("/:charityId", charityController.deleteCharity);

module.exports = router;

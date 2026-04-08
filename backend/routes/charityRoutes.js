const express = require("express");
const router = express.Router();
const charCtrl = require("../controllers/charityController");

router.get("/", charCtrl.getAllCharities);
router.get("/featured", charCtrl.getFeaturedCharities);
router.post("/", charCtrl.createCharity);
router.put("/:charityId", charCtrl.updateCharity);
router.delete("/:charityId", charCtrl.deleteCharity);

module.exports = router;

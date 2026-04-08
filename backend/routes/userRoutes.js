const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/profile/:userId", userController.getUserProfile);
router.put("/update-score/:userId", userController.addOrUpdateScore);

router.get("/admin/all", userController.getAllUsers);
router.put("/admin/edit-scores/:userId", userController.adminEditScores);
router.put("/admin/verify-winner/:userId", userController.updateWinnerStatus);
router.delete("/admin/delete/:userId", userController.deleteUser);

module.exports = router;

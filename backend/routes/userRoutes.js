const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// --- User Profile ---
router.get("/profile/:userId", userController.getUserProfile);

// --- Score Management (PRD Section 05: Rolling 5-Score Logic) ---
router.put("/update-score/:userId", userController.addOrUpdateScore);

// --- Admin Dashboard (PRD Section 11) ---
router.get("/admin/all", userController.getAllUsers);
router.put("/admin/verify-winner/:userId", userController.updateWinnerStatus);
router.delete("/admin/delete/:userId", userController.deleteUser);

module.exports = router;

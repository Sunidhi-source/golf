const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const {
  requireAuth,
  requireAdmin,
  checkAdmin,
} = require("../middleware/authMiddleware");

router.get("/profile/:userId", requireAuth, userController.getUserProfile);
router.put(
  "/update-score/:userId",
  requireAuth,
  userController.addOrUpdateScore,
);

router.get("/admin/check", requireAuth, checkAdmin);

router.get("/admin/all", requireAuth, requireAdmin, userController.getAllUsers);
router.put(
  "/admin/edit-scores/:userId",
  requireAuth,
  requireAdmin,
  userController.adminEditScores,
);
router.put(
  "/admin/verify-winner/:userId",
  requireAuth,
  requireAdmin,
  userController.updateWinnerStatus,
);
router.delete(
  "/admin/delete/:userId",
  requireAuth,
  requireAdmin,
  userController.deleteUser,
);

module.exports = router;

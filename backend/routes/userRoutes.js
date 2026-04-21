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

// TEMP diagnostic route - remove after fixing
router.get("/admin/debug", requireAuth, requireAdmin, async (req, res) => {
  const { createClient } = require("@supabase/supabase-js");
  const admin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Test 1: bare select
  const t1 = await admin.from("profiles").select("id, email").limit(1);
  // Test 2: with charity join
  const t2 = await admin.from("profiles").select("id, charity_id, charities(name)").limit(1);
  
  res.json({
    env: {
      hasUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
    },
    test1_bare: { error: t1.error, rowCount: t1.data?.length },
    test2_join: { error: t2.error, rowCount: t2.data?.length },
  });
});
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
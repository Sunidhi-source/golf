require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

//  GET /api/users/profile/:userId
exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      email,
      subscription_status,
      golf_scores,
      charity_id,
      charity_percent,
      payout_status,
      total_winnings,
      created_at,
      charities ( name )
    `,
    )
    .eq("id", userId)
    .single();

  if (error) {
    console.error("getUserProfile error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

// ── GET /api/users/admin/all
exports.getAllUsers = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select(
      `
      id,
      email,
      subscription_status,
      golf_scores,
      charity_percent,
      payout_status,
      total_winnings,
      created_at
    `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllUsers error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(data);
};

//  PUT /api/users/update-score/:userId
exports.addOrUpdateScore = async (req, res) => {
  const { userId } = req.params;
  const { newScore } = req.body;

  if (!newScore || typeof newScore.value === "undefined") {
    return res.status(400).json({ error: "Score value is required." });
  }

  const val = parseInt(newScore.value, 10);
  if (isNaN(val) || val < 1 || val > 45) {
    return res.status(400).json({ error: "Score must be between 1 and 45." });
  }

  if (!newScore.date) {
    return res.status(400).json({ error: "Score date is required." });
  }

  const { data: profile, error: fetchErr } = await supabaseAdmin
    .from("profiles")
    .select("golf_scores, subscription_status")
    .eq("id", userId)
    .single();

  if (fetchErr) {
    console.error("Score fetch error:", fetchErr.message);
    return res.status(500).json({ error: fetchErr.message });
  }

  if (profile.subscription_status !== "active") {
    return res
      .status(403)
      .json({ error: "Active subscription required to submit scores." });
  }

  const existing = Array.isArray(profile.golf_scores)
    ? profile.golf_scores
    : [];
  const updated = [...existing, { value: val, date: newScore.date }]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const { error: updateErr } = await supabaseAdmin
    .from("profiles")
    .update({ golf_scores: updated })
    .eq("id", userId);

  if (updateErr) {
    console.error("Score update error:", updateErr.message);
    return res.status(500).json({ error: updateErr.message });
  }

  return res
    .status(200)
    .json({ message: "Score updated successfully.", scores: updated });
};

// ── PUT /api/users/admin/verify-winner/:userId
exports.updateWinnerStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const valid = ["Pending", "Paid", "Rejected"];
  if (!valid.includes(status)) {
    return res
      .status(400)
      .json({ error: `Status must be one of: ${valid.join(", ")}` });
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ payout_status: status })
    .eq("id", userId);

  if (error) {
    console.error("updateWinnerStatus error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  return res
    .status(200)
    .json({ message: `Payout status updated to ${status}.` });
};

// ── DELETE /api/users/admin/delete/:userId
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("deleteUser error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

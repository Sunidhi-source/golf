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

exports.getUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from("profiles")
    .select("*, charities(name)")
    .eq("id", userId)
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

exports.getAllUsers = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

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

  const { data: profile, error: fetchError } = await supabaseAdmin
    .from("profiles")
    .select("golf_scores, subscription_status")
    .eq("id", userId)
    .single();

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  if (profile.subscription_status !== "active") {
    return res
      .status(403)
      .json({ error: "Active subscription required to submit scores." });
  }

  let scores = profile.golf_scores || [];

  scores.push({ value: val, date: newScore.date });

  scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  const updatedScores = scores.slice(0, 5);

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ golf_scores: updatedScores })
    .eq("id", userId);

  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.status(200).json({
    message: "Score updated successfully.",
    scores: updatedScores,
  });
};

exports.updateWinnerStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const validStatuses = ["Pending", "Paid", "Rejected"];
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ payout_status: status })
    .eq("id", userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ message: `Status updated to ${status}.` });
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

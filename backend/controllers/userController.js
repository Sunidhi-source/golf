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

  if (error) return res.status(500).json(error);
  res.status(200).json(data);
};

exports.getAllUsers = async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

exports.addOrUpdateScore = async (req, res) => {
  const { userId } = req.params;
  const { newScore } = req.body;

  if (newScore.value < 1 || newScore.value > 45) {
    return res.status(400).json({ error: "Score must be between 1-45 " });
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("golf_scores")
    .eq("id", userId)
    .single();

  let scores = profile.golf_scores || [];

  scores.push(newScore);

  scores.sort((a, b) => new Date(b.date) - new Date(a.date));

  const updatedScores = scores.slice(0, 5);

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ golf_scores: updatedScores })
    .eq("id", userId);

  if (error) return res.status(500).json(error);
  res.status(200).json({ message: "Score updated successfully ", data });
};

exports.updateWinnerStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ payout_status: status })
    .eq("id", userId);

  if (error) return res.status(500).json(error);
  res.status(200).json({ message: `Status updated to ${status} `, data });
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    res.status(200).json({ message: "User deleted successfully [cite: 107]" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

// 1. Standard Client (Respects RLS for users [cite: 135])
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// 2. Admin Client (Bypasses RLS - Essential for Admin Dashboard [cite: 135])
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// --- 01. User Profile (For User Dashboard [cite: 86]) ---
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

// --- 02. Admin: Fetch All Users (PRD Section 11 [cite: 98]) ---
exports.getAllUsers = async (req, res) => {
  // Use Admin Client to bypass RLS for Admin Dashboard visibility [cite: 135]
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false }); // Most recent first

  if (error) {
    console.error("Fetch Error:", error.message);
    return res.status(500).json({ error: error.message });
  }
  res.status(200).json(data);
};

// --- 03. Score Entry: Rolling 5-Score Logic (PRD Section 05 [cite: 42]) ---
exports.addOrUpdateScore = async (req, res) => {
  const { userId } = req.params;
  const { newScore } = req.body; // Expecting { value: 38, date: '2026-03-20' }

  // Validate Score Range: 1-45 (Stableford format )
  if (newScore.value < 1 || newScore.value > 45) {
    return res.status(400).json({ error: "Score must be between 1-45 " });
  }

  // 1. Fetch existing scores
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("golf_scores")
    .eq("id", userId)
    .single();

  let scores = profile.golf_scores || [];

  // 2. Add new score and enforce "Latest 5" [cite: 48]
  scores.push(newScore);

  // Sort by date: Most recent first
  scores.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Keep only the 5 most recent; new replaces oldest automatically
  const updatedScores = scores.slice(0, 5);

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ golf_scores: updatedScores })
    .eq("id", userId);

  if (error) return res.status(500).json(error);
  res.status(200).json({ message: "Score updated successfully ", data });
};

// --- 04. Admin: Winner Verification & Payout (PRD Section 09 & 11 [cite: 85, 109]) ---
exports.updateWinnerStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body; // 'Pending' or 'Paid' [cite: 85]

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ payout_status: status }) // Tracks Pending -> Paid state [cite: 85, 112]
    .eq("id", userId);

  if (error) return res.status(500).json(error);
  res.status(200).json({ message: `Status updated to ${status} `, data });
};

// --- 05. Admin: Delete User (PRD Section 11 [cite: 107]) ---
exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    // Delete from Supabase Auth (bypasses RLS [cite: 135])
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw error;
    res.status(200).json({ message: "User deleted successfully [cite: 107]" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

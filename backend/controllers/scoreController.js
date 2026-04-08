require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

exports.addScore = async (req, res) => {
  const { userId, scoreValue } = req.body;

  const val = parseInt(scoreValue, 10);
  if (isNaN(val) || val < 1 || val > 45) {
    return res.status(400).json({ error: "Score must be between 1 and 45" });
  }

  const date = new Date().toISOString().split("T")[0];
  const newScore = { value: val, date };

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("golf_scores")
    .eq("id", userId)
    .single();

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  let scores = profile.golf_scores || [];
  scores.push(newScore);
  scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  const updatedScores = scores.slice(0, 5);
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ golf_scores: updatedScores })
    .eq("id", userId);

  if (updateError) return res.status(500).json({ error: updateError.message });

  return res.status(200).json({
    message: "Score added. Rolling 5 logic applied.",
    scores: updatedScores,
  });
};

exports.getScores = async (req, res) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("golf_scores")
    .eq("id", req.params.userId)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const scores = (data.golf_scores || [])
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return res.status(200).json(scores);
};

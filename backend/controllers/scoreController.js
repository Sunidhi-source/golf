require("dotenv").config;
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

exports.addScore = async (req, res) => {
  const { userId, scoreValue } = req.body;

  if (scoreValue < 1 || scoreValue > 45) {
    return res.status(400).json({ error: "Score must be between 1 and 45" });
  }

  const { data, error } = await supabase
    .from("scores")
    .insert([{ user_id: userId, score_value: scoreValue }]);

  if (error) return res.status(500).json(error);
  res.status(200).json({ message: "Score added! Rolling logic applied." });
};

exports.getScores = async (req, res) => {
  const { data, error } = await supabase
    .from("scores")
    .select("*")
    .eq("user_id", req.params.userId)
    .order("recorded_at", { ascending: false })
    .limit(5);

  if (error) return res.status(500).json(error);
  res.status(200).json(data);
};

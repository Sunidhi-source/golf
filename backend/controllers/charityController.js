require("dotenv").config;

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// Fetch all charities for the signup dropdown
exports.getAllCharities = async (req, res) => {
  const { data, error } = await supabase.from("charities").select("*");

  if (error) return res.status(500).json(error);
  res.status(200).json(data);
};

// Fetch featured charities for the homepage (PRD requirement)
exports.getFeaturedCharities = async (req, res) => {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .eq("is_featured", true);

  if (error) return res.status(500).json(error);
  res.status(200).json(data);
};

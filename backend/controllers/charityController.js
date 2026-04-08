require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

exports.getAllCharities = async (req, res) => {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .order("name", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

exports.getFeaturedCharities = async (req, res) => {
  const { data, error } = await supabase
    .from("charities")
    .select("*")
    .eq("is_featured", true);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

exports.createCharity = async (req, res) => {
  const { name, description, is_featured } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Charity name is required." });
  }

  const { data, error } = await supabase
    .from("charities")
    .insert([
      {
        name: name.trim(),
        description: description || "",
        is_featured: !!is_featured,
      },
    ])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
};

exports.updateCharity = async (req, res) => {
  const { charityId } = req.params;
  const { name, description, is_featured } = req.body;

  const { data, error } = await supabase
    .from("charities")
    .update({ name, description, is_featured })
    .eq("id", charityId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

exports.deleteCharity = async (req, res) => {
  const { charityId } = req.params;

  const { error } = await supabase
    .from("charities")
    .delete()
    .eq("id", charityId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ message: "Charity deleted successfully." });
};

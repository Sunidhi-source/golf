const { createClient } = require("@supabase/supabase-js");

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

exports.requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorised — no token provided." });
  }

  const token = authHeader.split(" ")[1];

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: "Unauthorised — invalid token." });
  }

  req.user = user;
  next();
};

exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorised." });
  }
  if (req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ error: "Forbidden — admin only." });
  }
  next();
};

exports.checkAdmin = (req, res) => {
  const isAdmin = req.user?.email === ADMIN_EMAIL;
  return res.status(200).json({ isAdmin });
};

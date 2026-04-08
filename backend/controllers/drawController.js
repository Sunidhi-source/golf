require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

//  POST /api/draw/simulate
exports.executeDraw = async (req, res) => {
  try {
    const { type } = req.body;
    let winningNumbers = [];

    if (type === "algorithmic") {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("golf_scores")
        .eq("subscription_status", "active");

      if (pErr) throw pErr;

      const freq = {};
      (profiles || []).forEach((p) => {
        const scores = Array.isArray(p.golf_scores) ? p.golf_scores : [];
        scores.forEach((s) => {
          const v = typeof s === "object" ? s.value : s;
          if (v >= 1 && v <= 45) freq[v] = (freq[v] || 0) + 1;
        });
      });

      const pool = [];
      for (let i = 1; i <= 45; i++) {
        const weight = (freq[i] || 0) + 1;
        for (let w = 0; w < weight; w++) pool.push(i);
      }

      while (winningNumbers.length < 5) {
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (!winningNumbers.includes(pick)) winningNumbers.push(pick);
      }
    } else {
      while (winningNumbers.length < 5) {
        const n = Math.floor(Math.random() * 45) + 1;
        if (!winningNumbers.includes(n)) winningNumbers.push(n);
      }
    }

    const { data: users, error: uErr } = await supabase
      .from("profiles")
      .select("id, email, golf_scores")
      .eq("subscription_status", "active");

    if (uErr) throw uErr;

    const winners = { tier5: [], tier4: [], tier3: [] };

    (users || []).forEach((user) => {
      const scores = Array.isArray(user.golf_scores) ? user.golf_scores : [];
      const vals = scores.map((s) => (typeof s === "object" ? s.value : s));
      const matches = vals.filter((v) => winningNumbers.includes(v)).length;

      if (matches >= 5) winners.tier5.push({ id: user.id, email: user.email });
      else if (matches === 4)
        winners.tier4.push({ id: user.id, email: user.email });
      else if (matches === 3)
        winners.tier3.push({ id: user.id, email: user.email });
    });

    return res.status(200).json({
      message: "Simulation complete",
      winningNumbers,
      winners,
      summary: `5-Match: ${winners.tier5.length}, 4-Match: ${winners.tier4.length}, 3-Match: ${winners.tier3.length}`,
    });
  } catch (err) {
    console.error("executeDraw error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

exports.publishDraw = async (req, res) => {
  try {
    const { winningNumbers, winners, jackpotRollover } = req.body;

    if (!winningNumbers || !winners) {
      return res
        .status(400)
        .json({ error: "winningNumbers and winners are required." });
    }

    const { error: drawErr } = await supabase.from("draws").insert([
      {
        winning_numbers: winningNumbers,
        tier5_winners: winners.tier5 ?? [],
        tier4_winners: winners.tier4 ?? [],
        tier3_winners: winners.tier3 ?? [],
        jackpot_rollover: !!jackpotRollover,
        published_at: new Date().toISOString(),
      },
    ]);

    if (drawErr) throw drawErr;

    const tier5Ids = (winners.tier5 ?? []).map((w) =>
      typeof w === "object" ? w.id : w,
    );
    if (tier5Ids.length > 0) {
      const { error: payErr } = await supabase
        .from("profiles")
        .update({ payout_status: "Pending" })
        .in("id", tier5Ids);
      if (payErr) console.error("Payout mark error:", payErr.message);
    }

    return res.status(200).json({ message: "Draw published successfully." });
  } catch (err) {
    console.error("publishDraw error:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

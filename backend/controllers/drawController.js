require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

exports.executeDraw = async (req, res) => {
  try {
    const { type } = req.body;

    let winningNumbers = [];
    if (type === "random") {
      while (winningNumbers.length < 5) {
        let num = Math.floor(Math.random() * 45) + 1;
        if (!winningNumbers.includes(num)) winningNumbers.push(num);
      }
    } else {
      const { data: allScores } = await supabase
        .from("profiles")
        .select("golf_scores")
        .eq("subscription_status", "active");

      const freq = {};
      (allScores || []).forEach((u) => {
        (u.golf_scores || []).forEach((s) => {
          freq[s.value] = (freq[s.value] || 0) + 1;
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
    }

    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, email, subscription_status, golf_scores")
      .eq("subscription_status", "active");

    if (error) return res.status(500).json({ error: error.message });

    const winners = { tier5: [], tier4: [], tier3: [] };

    (users || []).forEach((user) => {
      const userScores = (user.golf_scores || []).map((s) => s.value);
      const matches = userScores.filter((score) =>
        winningNumbers.includes(score),
      ).length;

      if (matches >= 5) winners.tier5.push({ id: user.id, email: user.email });
      else if (matches === 4)
        winners.tier4.push({ id: user.id, email: user.email });
      else if (matches === 3)
        winners.tier3.push({ id: user.id, email: user.email });
    });

    return res.status(200).json({
      message: "Draw simulation complete",
      winningNumbers,
      winners,
      summary: `5-Match: ${winners.tier5.length}, 4-Match: ${winners.tier4.length}, 3-Match: ${winners.tier3.length}`,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.publishDraw = async (req, res) => {
  try {
    const { winningNumbers, winners, jackpotRollover } = req.body;

    const { error } = await supabase.from("draws").insert([
      {
        winning_numbers: winningNumbers,
        tier5_winners: winners.tier5,
        tier4_winners: winners.tier4,
        tier3_winners: winners.tier3,
        jackpot_rollover: jackpotRollover || false,
        published_at: new Date().toISOString(),
      },
    ]);

    if (error) return res.status(500).json({ error: error.message });

    if (winners.tier5.length > 0) {
      await supabase
        .from("profiles")
        .update({ payout_status: "Pending" })
        .in(
          "id",
          winners.tier5.map((w) => w.id),
        );
    }

    return res.status(200).json({ message: "Draw published successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

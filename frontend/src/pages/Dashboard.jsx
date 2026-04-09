import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

const API = process.env.REACT_APP_API_URL;

const getAuthHeaders = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return {};
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
};

const WinnerProofUpload = ({ userId, onDone }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const path = `${userId}/${Date.now()}_${file.name}`;
      const { error } = await supabase.storage
        .from("winner-proofs")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      setDone(true);
      onDone?.();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="mt-6 p-5 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 text-sm font-bold">
        ✓ Proof submitted — our team will review and process your payout.
      </div>
    );
  }

  return (
    <div className="mt-6 p-7 bg-amber-500/10 border border-amber-500/30 rounded-[2rem]">
      <p className="text-amber-400 font-black text-xs uppercase tracking-widest mb-2">
        Winner Verification Required
      </p>
      <p className="text-slate-400 text-sm mb-5">
        Upload a screenshot of your scores from the golf platform to claim your
        prize.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-slate-400 text-sm flex-1"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black text-sm disabled:opacity-50 hover:bg-amber-400 transition-all whitespace-nowrap"
        >
          {uploading ? "Uploading…" : "Submit Proof"}
        </button>
      </div>
    </div>
  );
};

const DrawHistory = ({ userId }) => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/draw/history`)
      .then((r) => r.json())
      .then((data) => setDraws(Array.isArray(data) ? data : []))
      .catch(() => setDraws([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-8 text-center text-slate-600 text-xs font-mono uppercase tracking-widest">
        Loading draw history…
      </div>
    );
  }

  if (draws.length === 0) {
    return (
      <div className="py-8 text-center border-2 border-dashed border-slate-800 rounded-[2rem] text-slate-600 font-mono text-xs uppercase tracking-widest">
        No draws published yet — stay subscribed to enter automatically.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {draws.map((d) => {
        const isWinner5 = (d.tier5_winners || []).some(
          (w) => (typeof w === "object" ? w.id : w) === userId,
        );
        const isWinner4 = (d.tier4_winners || []).some(
          (w) => (typeof w === "object" ? w.id : w) === userId,
        );
        const isWinner3 = (d.tier3_winners || []).some(
          (w) => (typeof w === "object" ? w.id : w) === userId,
        );
        const winTier = isWinner5
          ? "5-Match 🏆"
          : isWinner4
            ? "4-Match 🎯"
            : isWinner3
              ? "3-Match ✓"
              : null;

        return (
          <div
            key={d.id}
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              winTier
                ? "bg-cyan-500/10 border-cyan-500/30"
                : "bg-slate-900/30 border-slate-800"
            }`}
          >
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                {new Date(d.published_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              <div className="flex gap-2 flex-wrap">
                {(d.winning_numbers || []).map((n, i) => (
                  <span
                    key={i}
                    className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-black text-white"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
            {winTier ? (
              <span className="text-cyan-400 text-xs font-black uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 whitespace-nowrap">
                You won: {winTier}
              </span>
            ) : (
              <span className="text-slate-600 text-xs font-mono">No match</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ParticipationSummary = ({ scores, profile }) => {
  const hasEnoughScores = scores.length >= 3;
  const isActive = profile?.subscription_status === "active";

  const now = new Date();
  const nextDraw = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilDraw = Math.ceil((nextDraw - now) / (1000 * 60 * 60 * 24));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="grid sm:grid-cols-3 gap-5">
        {/* Entry status */}
        <div
          className={`p-7 rounded-[2.5rem] border ${
            isActive && hasEnoughScores
              ? "bg-cyan-500/10 border-cyan-500/30"
              : "bg-slate-900/50 border-slate-800"
          }`}
        >
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            Draw Entry Status
          </p>
          <p
            className={`text-xl font-black uppercase ${
              isActive && hasEnoughScores ? "text-cyan-400" : "text-red-400"
            }`}
          >
            {!isActive
              ? "Not Subscribed"
              : !hasEnoughScores
                ? "Needs Scores"
                : "Entered ✓"}
          </p>
          <p className="text-slate-500 text-xs mt-2">
            {!isActive
              ? "Subscribe to enter draws"
              : !hasEnoughScores
                ? `Need at least 3 scores (have ${scores.length})`
                : "You're entered in the next draw"}
          </p>
        </div>

        <div className="p-7 rounded-[2.5rem] border border-slate-800 bg-slate-900/50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            Next Draw
          </p>
          <p className="text-4xl font-black text-white">{daysUntilDraw}</p>
          <p className="text-slate-500 text-xs mt-2">
            days until{" "}
            {nextDraw.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>

        {/* Scores entered */}
        <div className="p-7 rounded-[2.5rem] border border-slate-800 bg-slate-900/50">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
            Scores Submitted
          </p>
          <p className="text-4xl font-black text-white">{scores.length}/5</p>
          <p className="text-slate-500 text-xs mt-2">
            {scores.length === 5
              ? "Rolling 5 complete"
              : `${5 - scores.length} more to complete your entry`}
          </p>
        </div>
      </div>

      {/* How draws work reminder */}
      <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-[2rem]">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
          How Your Entry Works
        </p>
        <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="flex items-start gap-3">
            <span className="text-cyan-400 font-black text-lg leading-none">
              1
            </span>
            <p>
              Your latest 5 Stableford scores form your draw entry each month.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-cyan-400 font-black text-lg leading-none">
              2
            </span>
            <p>5 numbers are drawn. Match 3, 4, or 5 to win your prize tier.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-cyan-400 font-black text-lg leading-none">
              3
            </span>
            <p>
              Winners verify their scores. Prizes are split equally per tier.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState("");
  const [scoreDate, setScoreDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState("scores");

  const fetchUserData = useCallback(async (userId) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/users/profile/${userId}`, {
        headers,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setProfile(data);
      const sorted = [...(data.golf_scores || [])]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);
      setScores(sorted);
    } catch (err) {
      setError("Could not load your profile. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });
  }, [fetchUserData]);

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const val = parseInt(newScore, 10);
    if (isNaN(val) || val < 1 || val > 45) {
      setError("Score must be a number between 1 and 45.");
      return;
    }
    if (!scoreDate) {
      setError("Please select a date for this round.");
      return;
    }

    setSubmitting(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`${API}/api/users/update-score/${user.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ newScore: { value: val, date: scoreDate } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setNewScore("");
      setScoreDate(new Date().toISOString().split("T")[0]);
      setSuccess("Score added to your rolling 5!");
      fetchUserData(user.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-500 font-mono text-xs tracking-widest uppercase">
        Loading dashboard…
      </div>
    );
  }

  const isActive = profile?.subscription_status === "active";

  const renewalDate = profile?.renewal_date
    ? new Date(profile.renewal_date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-2">
              Active Impact
            </p>
            <h2 className="text-2xl font-black italic uppercase">
              Supporting {profile?.charities?.name || "Global Outreach"}
            </h2>
            <p className="text-slate-400 mt-1 text-sm">
              {profile?.charity_percent || 10}% of your subscription powers
              their mission monthly.
            </p>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Subscription
            </p>
            <p
              className={`text-xl font-black uppercase ${isActive ? "text-green-400" : "text-red-500"}`}
            >
              {profile?.subscription_status || "Inactive"}
            </p>
            {isActive && renewalDate && (
              <p className="text-slate-500 text-xs mt-1">
                Renews {renewalDate}
              </p>
            )}
            {!isActive && (
              <a
                href="/pricing"
                className="text-xs text-cyan-400 font-bold hover:underline mt-1 block"
              >
                Subscribe to unlock →
              </a>
            )}
          </div>
        </motion.div>

        <div className="flex gap-2 mb-8 border-b border-slate-800 pb-4 overflow-x-auto">
          {[
            { id: "scores", label: "Score Entry" },
            { id: "participation", label: "Participation" },
            { id: "draws", label: "Draw History" },
            { id: "winnings", label: "Winnings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeSection === tab.id
                  ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeSection === "scores" && (
          <div className="grid lg:grid-cols-3 gap-10">
            <div
              className={
                !isActive ? "opacity-30 pointer-events-none select-none" : ""
              }
            >
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">
                Score Entry
              </p>
              <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
                <h3 className="text-lg font-bold mb-1">Enter Round Score</h3>
                <p className="text-xs text-slate-500 mb-6">
                  Stableford · 1–45 · Latest 5 kept
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-bold">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmitScore} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                      Score (1–45)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="45"
                      required
                      value={newScore}
                      onChange={(e) => setNewScore(e.target.value)}
                      placeholder="e.g. 32"
                      className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl focus:border-cyan-500 outline-none transition-all font-bold text-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">
                      Round Date
                    </label>
                    <input
                      type="date"
                      required
                      value={scoreDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setScoreDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl focus:border-cyan-500 outline-none transition-all text-white font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-cyan-500 text-black font-black py-4 rounded-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all uppercase tracking-tighter disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit to Rolling 5"}
                  </button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="flex justify-between items-end mb-4">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  Performance History
                </p>
                <p className="text-[10px] text-slate-600 italic font-bold uppercase">
                  Latest 5 rounds retained
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {scores.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 }}
                    className="aspect-square flex flex-col items-center justify-center bg-slate-900/30 border border-slate-800 rounded-[2rem] relative group overflow-hidden"
                  >
                    <div className="text-4xl font-black text-cyan-400">
                      {s.value}
                    </div>
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mt-1">
                      {s.date}
                    </div>
                    <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
                {scores.length === 0 && (
                  <div className="col-span-full py-14 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-600 font-mono text-xs uppercase tracking-widest">
                    No scores yet — submit your first round
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === "participation" && (
          <ParticipationSummary scores={scores} profile={profile} />
        )}

        {activeSection === "draws" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-6">
              Past Draws · Your Participation
            </p>
            <DrawHistory userId={user?.id} />
          </motion.div>
        )}

        {activeSection === "winnings" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid sm:grid-cols-2 gap-5 mb-8">
              <div className="bg-slate-900/50 p-7 rounded-[2.5rem] border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Total Winnings
                </p>
                <p className="text-4xl font-black text-white">
                  ${profile?.total_winnings || "0.00"}
                </p>
              </div>
              <div className="bg-slate-900/50 p-7 rounded-[2.5rem] border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Payout Status
                </p>
                <p
                  className={`text-xl font-black uppercase italic ${
                    profile?.payout_status === "Pending"
                      ? "text-amber-400"
                      : profile?.payout_status === "Paid"
                        ? "text-green-400"
                        : "text-slate-500"
                  }`}
                >
                  {profile?.payout_status || "No Pending"}
                </p>
              </div>
            </div>

            {profile?.payout_status === "Pending" && (
              <WinnerProofUpload
                userId={user?.id}
                onDone={() => fetchUserData(user?.id)}
              />
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

const API = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState("");
  const [scoreDate, setScoreDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    };
    getSession();
  }, []);

  const fetchUserData = async (userId) => {
    try {
      const res = await fetch(`${API}/api/users/profile/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfile(data);
      const sorted = (data.golf_scores || []).sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );
      setScores(sorted.slice(0, 5));
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Could not load your profile. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    setError("");

    if (profile?.subscription_status !== "active") {
      setError("An active subscription is required to submit scores.");
      return;
    }

    const scoreVal = parseInt(newScore, 10);
    if (isNaN(scoreVal) || scoreVal < 1 || scoreVal > 45) {
      setError("Score must be a number between 1 and 45.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API}/api/users/update-score/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newScore: { value: scoreVal, date: scoreDate },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Submission failed");
      }

      setNewScore("");
      setScoreDate(new Date().toISOString().split("T")[0]);
      fetchUserData(user.id);
    } catch (err) {
      setError(err.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono text-cyan-400">
        Loading dashboard...
      </div>
    );

  const isActive = profile?.subscription_status === "active";

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-32 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
        {/* Charity Impact Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-8 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-[2.5rem] flex justify-between items-center"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-2">
              Active Impact
            </p>
            <h2 className="text-3xl font-black italic uppercase">
              Supporting {profile?.charities?.name || "Global Outreach"}
            </h2>
            <p className="text-slate-400 mt-1">
              {profile?.charity_percent || 10}% of your subscription powers
              their mission every month.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Subscription
            </p>
            <p
              className={`text-xl font-black uppercase ${isActive ? "text-green-400" : "text-red-500"}`}
            >
              {profile?.subscription_status || "Inactive"}
            </p>
            {!isActive && (
              <a
                href="/pricing"
                className="text-xs text-cyan-400 font-bold mt-1 block hover:underline"
              >
                Subscribe to unlock →
              </a>
            )}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Score Entry */}
          <div
            className={`${!isActive ? "opacity-30 pointer-events-none" : ""}`}
          >
            <h2 className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-4">
              Score Entry
            </h2>
            <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
              <h3 className="text-xl font-bold mb-2">Enter Round Score</h3>
              <p className="text-xs text-slate-500 mb-6">
                Stableford format · Range: 1–45 · Latest 5 retained
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitScore} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
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
                    className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl focus:border-cyan-500 outline-none transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">
                    Round Date
                  </label>
                  <input
                    type="date"
                    required
                    value={scoreDate}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setScoreDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl focus:border-cyan-500 outline-none transition-all font-bold text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-cyan-500 text-black font-black py-5 rounded-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all uppercase tracking-tighter disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit to Rolling 5"}
                </button>
              </form>
            </div>
          </div>

          {/* Score History & Stats */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-mono text-slate-500 uppercase tracking-widest">
                Performance History
              </h2>
              <p className="text-[10px] font-bold text-slate-600 uppercase italic">
                Latest 5 rounds retained
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {scores.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
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
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-600 font-mono text-xs">
                  No scores yet — submit your first round above
                </div>
              )}
            </div>

            {/* Winnings & Participation Summary */}
            <div className="mt-12 grid grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Total Winnings
                </p>
                <p className="text-4xl font-black text-white">
                  ${profile?.total_winnings || "0.00"}
                </p>
              </div>
              <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Payout Status
                </p>
                <p
                  className={`text-xl font-black uppercase italic ${
                    profile?.payout_status === "Pending"
                      ? "text-amber-400"
                      : profile?.payout_status === "Paid"
                        ? "text-green-400"
                        : "text-cyan-400"
                  }`}
                >
                  {profile?.payout_status || "No Pending"}
                </p>
              </div>
            </div>

            {/* Winner proof upload — PRD Section 09 */}
            {profile?.payout_status === "Pending" && (
              <WinnerProofUpload
                userId={user?.id}
                onUpload={() => fetchUserData(user.id)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Winner proof upload component (PRD Section 09)
const WinnerProofUpload = ({ userId, onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const { error } = await supabase.storage
        .from("winner-proofs")
        .upload(`${userId}/${Date.now()}_${file.name}`, file, {
          upsert: true,
        });

      if (error) throw error;
      setDone(true);
      onUpload();
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (done) {
    return (
      <div className="mt-6 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 text-sm font-bold">
        Proof submitted — our team will review and process your payout.
      </div>
    );
  }

  return (
    <div className="mt-6 p-8 bg-amber-500/10 border border-amber-500/30 rounded-[2rem]">
      <p className="text-amber-400 font-black text-sm uppercase tracking-widest mb-2">
        Winner Verification Required
      </p>
      <p className="text-slate-400 text-sm mb-4">
        Upload a screenshot of your scores from the golf platform to claim your
        prize.
      </p>
      <div className="flex gap-4 items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-slate-400 text-sm flex-1"
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="bg-amber-500 text-black px-6 py-3 rounded-xl font-black text-sm disabled:opacity-50 hover:bg-amber-400 transition-all"
        >
          {uploading ? "Uploading..." : "Submit Proof"}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "../supabaseClient";

const Dashboard = () => {
  const [scores, setScores] = useState([]);
  const [newScore, setNewScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

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
      // Fetching profile which contains scores, sub status, and charity info
      const res = await fetch(
        `https://golf-u6ol.onrender.com/api/users/profile/${userId}`,
      );
      const data = await res.json();
      setProfile(data);
      setScores(data.golf_scores || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    if (profile?.subscription_status !== "active")
      return alert("Active subscription required!");

    const scoreVal = parseInt(newScore);
    const date = new Date().toISOString().split("T")[0]; // Required by PRD Section 05

    try {
      const response = await fetch(
        `https://golf-u6ol.onrender.com/api/users/update-score/${user.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newScore: { value: scoreVal, date } }),
        },
      );

      if (response.ok) {
        setNewScore("");
        fetchUserData(user.id);
      }
    } catch (err) {
      alert("Submission failed.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center font-mono text-cyan-400">
        LOADING_SECURE_DASHBOARD...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-32 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
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
              10% of your subscription powers their mission every month. [cite:
              77]
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Sub Status
            </p>
            <p
              className={`text-xl font-black uppercase ${profile?.subscription_status === "active" ? "text-green-400" : "text-red-500"}`}
            >
              {profile?.subscription_status || "Inactive"}
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div
            className={`${profile?.subscription_status !== "active" ? "opacity-20 grayscale pointer-events-none" : ""}`}
          >
            <h2 className="text-sm font-mono text-slate-500 uppercase tracking-widest mb-4">
              Input_Terminal
            </h2>
            <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800">
              <h3 className="text-xl font-bold mb-6">Enter Round Score</h3>
              <form onSubmit={handleSubmitScore} className="space-y-4">
                <input
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="Points (1-45)"
                  className="w-full bg-slate-950 border border-slate-800 p-5 rounded-2xl focus:border-cyan-500 outline-none transition-all font-bold"
                />
                <button className="w-full bg-cyan-500 text-black font-black py-5 rounded-2xl hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all uppercase tracking-tighter">
                  Submit to Rolling 5
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-sm font-mono text-slate-500 uppercase tracking-widest">
                Performance_History
              </h2>
              <p className="text-[10px] font-bold text-slate-600 uppercase italic">
                Latest 5 rounds retained [cite: 48]
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
                  NO_DATA_FOUND: ADD YOUR FIRST SCORE
                </div>
              )}
            </div>

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
                <p className="text-xl font-black text-cyan-400 uppercase italic">
                  {profile?.payout_status || "No Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

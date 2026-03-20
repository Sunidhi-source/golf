import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("draws");
  const [drawType, setDrawType] = useState("random");
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Data States
  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [stats, setStats] = useState({ totalPool: 0, charityTotal: 0 });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Users (Section 11) [cite: 98]
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*");
      if (userError) throw userError;
      setUsers(userData || []);

      // 2. Fetch Charities (Section 11) [cite: 106]
      const { data: charityData, error: charityError } = await supabase
        .from("charities")
        .select("*");
      if (charityError) throw charityError;
      setCharities(charityData || []);

      // 3. Auto-calculation of Pool (Section 07) [cite: 71]
      const activeSubs =
        userData?.filter((u) => u.subscription_status === "active").length || 0;
      const currentPool = activeSubs * 19; // Monthly plan base [cite: 41]

      setStats({
        totalPool: currentPool,
        charityTotal: currentPool * 0.1, // 10% Minimum [cite: 77]
      });
    } catch (err) {
      console.error("Error fetching admin data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = () => {
    setLoading(true);
    // Simulate Draw Logic (Section 06) [cite: 56, 63]
    setTimeout(() => {
      setSimulationResult({
        winningNumbers: Array.from(
          { length: 5 },
          () => Math.floor(Math.random() * 45) + 1,
        ),
        poolDistribution: {
          tier5: stats.totalPool * 0.4, // 40% [cite: 70]
          tier4: stats.totalPool * 0.35, // 35% [cite: 70]
          tier3: stats.totalPool * 0.25, // 25% [cite: 70]
        },
      });
      setLoading(false);
    }, 1000);
  };

  // Section 09: Winner Verification [cite: 85, 112]
  const handleVerifyWinner = async (userId, status) => {
    const { error } = await supabase
      .from("profiles")
      .update({ payout_status: status }) // Pending -> Paid [cite: 85]
      .eq("id", userId);

    if (!error) fetchAdminData();
  };

  return (
    <div className="pt-28 pb-20 px-8 max-w-7xl mx-auto min-h-screen bg-[#020617] text-white">
      {/* HEADER & ANALYTICS [cite: 113] */}
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">
            Admin<span className="text-cyan-400">Portal</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs tracking-[0.2em] mt-2 italic">
            SYSTEM OVERSIGHT & GOVERNANCE [cite: 9]
          </p>
        </div>
        <div className="flex gap-10">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">
              Total Prize Pool [cite: 115]
            </p>
            <p className="text-4xl font-black text-cyan-400">
              ${stats.totalPool}
            </p>
          </div>
          <div className="text-right border-l border-slate-800 pl-10">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">
              Charity Impact [cite: 116]
            </p>
            <p className="text-4xl font-black text-white">
              ${stats.charityTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* TABS [cite: 97] */}
      <div className="flex gap-4 mb-10 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit">
        {["draws", "users", "charities"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab
                ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                : "text-slate-500 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* DRAW ENGINE (Section 06) [cite: 51] */}
        {activeTab === "draws" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 h-fit">
              <h2 className="text-xl font-bold mb-6 italic">
                Monthly Draw Engine [cite: 61]
              </h2>
              <div className="space-y-6">
                <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex">
                  <button
                    onClick={() => setDrawType("random")}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase ${drawType === "random" ? "bg-cyan-500 text-black" : "text-slate-500"}`}
                  >
                    Random [cite: 57]
                  </button>
                  <button
                    onClick={() => setDrawType("algorithmic")}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase ${drawType === "algorithmic" ? "bg-blue-600 text-white" : "text-slate-500"}`}
                  >
                    Weighted [cite: 59]
                  </button>
                </div>
                <button
                  onClick={runSimulation}
                  className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase text-sm tracking-tighter"
                >
                  {loading
                    ? "SIMULATING..."
                    : "RUN MONTHLY SIMULATION [cite: 104]"}
                </button>
              </div>
            </div>

            {simulationResult && (
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-10 rounded-[2.5rem] border border-cyan-500/20">
                  <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-8">
                    Generated Combination [cite: 53]
                  </h3>
                  <div className="flex gap-4 mb-10">
                    {simulationResult.winningNumbers.map((n, i) => (
                      <div
                        key={i}
                        className="w-16 h-16 rounded-full bg-cyan-500 text-black flex items-center justify-center text-3xl font-black"
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4 font-mono">
                    <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase font-black mb-2">
                        5-Match (40%) [cite: 70]
                      </p>
                      <p className="text-2xl font-black">
                        $
                        {simulationResult.poolDistribution.tier5.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/5 text-slate-400">
                      <p className="text-[10px] uppercase font-black mb-2">
                        4-Match (35%) [cite: 70]
                      </p>
                      <p className="text-2xl font-black">
                        $
                        {simulationResult.poolDistribution.tier4.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/5 text-slate-400">
                      <p className="text-[10px] uppercase font-black mb-2">
                        3-Match (25%) [cite: 70]
                      </p>
                      <p className="text-2xl font-black">
                        $
                        {simulationResult.poolDistribution.tier3.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <button className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all">
                  Publish Official Results [cite: 105]
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* USER LIST (Section 11) [cite: 98] */}
        {activeTab === "users" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-900/30 rounded-[2.5rem] border border-slate-800 overflow-hidden"
          >
            <table className="w-full text-left">
              <thead className="bg-slate-900/80 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <tr>
                  <th className="p-6">User / Email</th>
                  <th className="p-6">Subscription [cite: 101]</th>
                  <th className="p-6">Rolling Scores [cite: 44]</th>
                  <th className="p-6 text-right">Actions [cite: 111]</th>
                </tr>
              </thead>
              <tbody className="text-sm font-mono">
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-t border-slate-800 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-6 font-bold text-white">{u.email}</td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.subscription_status === "active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                      >
                        {u.subscription_status || "inactive"} [cite: 41]
                      </span>
                    </td>
                    <td className="p-6 text-slate-500 italic">
                      {u.golf_scores?.slice(0, 5).join(", ") ||
                        "No scores recorded"}{" "}
                      [cite: 48]
                    </td>
                    <td className="p-6 text-right">
                      {u.payout_status === "Pending" ? (
                        <button
                          onClick={() => handleVerifyWinner(u.id, "Paid")}
                          className="text-green-400 text-[10px] font-black uppercase hover:underline mr-4"
                        >
                          Approve Payout [cite: 112]
                        </button>
                      ) : null}
                      <button className="text-cyan-400 font-black text-[10px] uppercase hover:underline">
                        Review Proof [cite: 111]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* CHARITY MANAGEMENT (Section 11) [cite: 106] */}
        {activeTab === "charities" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {charities.map((c) => (
              <div
                key={c.id}
                className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex justify-between items-center group"
              >
                <div>
                  <h4 className="font-bold text-white uppercase italic">
                    {c.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-black">
                    Impact Active [cite: 75]
                  </p>
                </div>
                <button className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase">
                  Delete [cite: 107]
                </button>
              </div>
            ))}
            <button className="border-2 border-dashed border-slate-800 p-6 rounded-3xl text-slate-500 hover:border-cyan-500 hover:text-cyan-400 transition-all font-black text-xs uppercase">
              + Add New Charity [cite: 107]
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;

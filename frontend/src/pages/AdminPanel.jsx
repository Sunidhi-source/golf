import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

const API = process.env.REACT_APP_API_URL;

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("draws");
  const [drawType, setDrawType] = useState("random");
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [publishMsg, setPublishMsg] = useState("");

  const [users, setUsers] = useState([]);
  const [charities, setCharities] = useState([]);
  const [stats, setStats] = useState({ totalPool: 0, charityTotal: 0 });

  // Charity form state
  const [newCharity, setNewCharity] = useState({
    name: "",
    description: "",
    is_featured: false,
  });
  const [addingCharity, setAddingCharity] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*");
      if (userError) throw userError;
      setUsers(userData || []);

      const { data: charityData, error: charityError } = await supabase
        .from("charities")
        .select("*");
      if (charityError) throw charityError;
      setCharities(charityData || []);

      const activeSubs =
        userData?.filter((u) => u.subscription_status === "active").length || 0;
      const currentPool = activeSubs * 19;
      setStats({
        totalPool: currentPool,
        charityTotal: currentPool * 0.1,
      });
    } catch (err) {
      console.error("Error fetching admin data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const runSimulation = async () => {
    setLoading(true);
    setPublishMsg("");
    try {
      const res = await fetch(`${API}/api/draw/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: drawType }),
      });
      const data = await res.json();
      setSimulationResult({
        winningNumbers: data.winningNumbers,
        winners: data.winners,
        poolDistribution: {
          tier5: stats.totalPool * 0.4,
          tier4: stats.totalPool * 0.35,
          tier3: stats.totalPool * 0.25,
        },
      });
    } catch (err) {
      alert("Draw simulation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishDraw = async () => {
    if (!simulationResult) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/draw/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winningNumbers: simulationResult.winningNumbers,
          winners: simulationResult.winners,
          jackpotRollover: simulationResult.winners.tier5.length === 0,
        }),
      });
      const data = await res.json();
      setPublishMsg(data.message || "Published successfully");
      setSimulationResult(null);
      fetchAdminData();
    } catch (err) {
      alert("Publish failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyWinner = async (userId, status) => {
    const { error } = await supabase
      .from("profiles")
      .update({ payout_status: status })
      .eq("id", userId);
    if (!error) fetchAdminData();
  };

  const handleDeleteCharity = async (charityId) => {
    if (!window.confirm("Delete this charity?")) return;
    const { error } = await supabase
      .from("charities")
      .delete()
      .eq("id", charityId);
    if (!error) fetchAdminData();
  };

  const handleAddCharity = async () => {
    if (!newCharity.name.trim()) return;
    setAddingCharity(true);
    const { error } = await supabase.from("charities").insert([newCharity]);
    if (!error) {
      setNewCharity({ name: "", description: "", is_featured: false });
      fetchAdminData();
    }
    setAddingCharity(false);
  };

  return (
    <div className="pt-28 pb-20 px-8 max-w-7xl mx-auto min-h-screen bg-[#020617] text-white">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">
            Admin<span className="text-cyan-400">Portal</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs tracking-[0.2em] mt-2 italic">
            System Oversight & Governance
          </p>
        </div>
        <div className="flex gap-10">
          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">
              Total Prize Pool
            </p>
            <p className="text-4xl font-black text-cyan-400">
              ${stats.totalPool}
            </p>
          </div>
          <div className="text-right border-l border-slate-800 pl-10">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">
              Charity Contributions
            </p>
            <p className="text-4xl font-black text-white">
              ${stats.charityTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

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
        {/* Draw Tab */}
        {activeTab === "draws" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-3 gap-8"
          >
            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 h-fit">
              <h2 className="text-xl font-bold mb-6 italic">
                Monthly Draw Engine
              </h2>
              <div className="space-y-6">
                <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex">
                  <button
                    onClick={() => setDrawType("random")}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase ${drawType === "random" ? "bg-cyan-500 text-black" : "text-slate-500"}`}
                  >
                    Random
                  </button>
                  <button
                    onClick={() => setDrawType("algorithmic")}
                    className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase ${drawType === "algorithmic" ? "bg-blue-600 text-white" : "text-slate-500"}`}
                  >
                    Weighted
                  </button>
                </div>
                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase text-sm tracking-tighter disabled:opacity-50"
                >
                  {loading ? "Simulating..." : "Run Simulation"}
                </button>
              </div>
            </div>

            {simulationResult && (
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-10 rounded-[2.5rem] border border-cyan-500/20">
                  <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-8">
                    Generated Combination
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
                        5-Match Jackpot (40%)
                      </p>
                      <p className="text-2xl font-black">
                        $
                        {simulationResult.poolDistribution.tier5.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {simulationResult.winners?.tier5?.length || 0} winner(s)
                        {simulationResult.winners?.tier5?.length === 0 && (
                          <span className="text-amber-400 ml-1">
                            → Jackpot rolls over
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/5 text-slate-400">
                      <p className="text-[10px] uppercase font-black mb-2">
                        4-Match (35%)
                      </p>
                      <p className="text-2xl font-black">
                        $
                        {simulationResult.poolDistribution.tier4.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {simulationResult.winners?.tier4?.length || 0} winner(s)
                      </p>
                    </div>
                    <div className="bg-slate-900/80 p-6 rounded-2xl border border-white/5 text-slate-400">
                      <p className="text-[10px] uppercase font-black mb-2">
                        3-Match (25%)
                      </p>
                      <p className="text-2xl font-black">
                        $
                        {simulationResult.poolDistribution.tier3.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {simulationResult.winners?.tier3?.length || 0} winner(s)
                      </p>
                    </div>
                  </div>
                </div>

                {publishMsg && (
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl text-green-400 font-bold text-sm">
                    {publishMsg}
                  </div>
                )}

                <button
                  onClick={handlePublishDraw}
                  disabled={loading}
                  className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50"
                >
                  {loading ? "Publishing..." : "Publish Official Results"}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Users Tab */}
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
                  <th className="p-6">Subscription</th>
                  <th className="p-6">Rolling Scores</th>
                  <th className="p-6 text-right">Actions</th>
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
                        {u.subscription_status || "inactive"}
                      </span>
                    </td>
                    <td className="p-6 text-slate-500 italic">
                      {(u.golf_scores || [])
                        .slice(0, 5)
                        .map((s) => s.value)
                        .join(", ") || "No scores"}
                    </td>
                    <td className="p-6 text-right space-x-3">
                      {u.payout_status === "Pending" && (
                        <button
                          onClick={() => handleVerifyWinner(u.id, "Paid")}
                          className="text-green-400 text-[10px] font-black uppercase hover:underline"
                        >
                          Approve Payout
                        </button>
                      )}
                      {u.payout_status === "Pending" && (
                        <button
                          onClick={() => handleVerifyWinner(u.id, "Rejected")}
                          className="text-red-400 text-[10px] font-black uppercase hover:underline"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}

        {activeTab === "charities" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 mb-8">
              <h3 className="text-lg font-bold mb-6">Add New Charity</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Charity name"
                  value={newCharity.name}
                  onChange={(e) =>
                    setNewCharity({ ...newCharity, name: e.target.value })
                  }
                  className="bg-slate-950 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-500"
                />
                <input
                  type="text"
                  placeholder="Short description"
                  value={newCharity.description}
                  onChange={(e) =>
                    setNewCharity({
                      ...newCharity,
                      description: e.target.value,
                    })
                  }
                  className="bg-slate-950 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-cyan-500"
                />
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCharity.is_featured}
                      onChange={(e) =>
                        setNewCharity({
                          ...newCharity,
                          is_featured: e.target.checked,
                        })
                      }
                      className="accent-cyan-500"
                    />
                    Featured
                  </label>
                  <button
                    onClick={handleAddCharity}
                    disabled={addingCharity || !newCharity.name.trim()}
                    className="flex-1 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all disabled:opacity-50"
                  >
                    {addingCharity ? "Adding..." : "Add"}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {charities.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 flex justify-between items-start group"
                >
                  <div>
                    <h4 className="font-bold text-white uppercase italic">
                      {c.name}
                    </h4>
                    {c.description && (
                      <p className="text-xs text-slate-500 mt-1">
                        {c.description}
                      </p>
                    )}
                    {c.is_featured && (
                      <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-black uppercase mt-2 inline-block">
                        Featured
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteCharity(c.id)}
                    className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase ml-4 flex-shrink-0"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;

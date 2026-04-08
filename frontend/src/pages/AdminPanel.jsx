import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

const API = process.env.REACT_APP_API_URL;

// ─── small reusable stat card ────────────────────────────────────────────────
const StatCard = ({ label, value, accent }) => (
  <div className="text-right">
    <p className="text-[10px] text-slate-500 uppercase font-black mb-1 tracking-widest">
      {label}
    </p>
    <p
      className={`text-4xl font-black ${accent ? "text-cyan-400" : "text-white"}`}
    >
      {value}
    </p>
  </div>
);

// ─── tab button ──────────────────────────────────────────────────────────────
const Tab = ({ id, active, onClick, children }) => (
  <button
    onClick={() => onClick(id)}
    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
      active
        ? "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        : "text-slate-500 hover:text-white"
    }`}
  >
    {children}
  </button>
);

// ─── toast notification ──────────────────────────────────────────────────────
const Toast = ({ msg, type }) => {
  if (!msg) return null;
  const colours =
    type === "error"
      ? "bg-red-500/10 border-red-500/30 text-red-400"
      : "bg-green-500/10 border-green-500/30 text-green-400";
  return (
    <div className={`p-4 border rounded-2xl text-sm font-bold mb-6 ${colours}`}>
      {msg}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("draws");

  // draw state
  const [drawType, setDrawType] = useState("random");
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [drawToast, setDrawToast] = useState({ msg: "", type: "" });

  // users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersToast, setUsersToast] = useState({ msg: "", type: "" });

  // charities state
  const [charities, setCharities] = useState([]);
  const [charLoading, setCharLoading] = useState(false);
  const [charToast, setCharToast] = useState({ msg: "", type: "" });
  const [newCharity, setNewCharity] = useState({
    name: "",
    description: "",
    is_featured: false,
  });
  const [addingCharity, setAddingCharity] = useState(false);

  // stats (header)
  const [stats, setStats] = useState({
    totalPool: 0,
    charityTotal: 0,
    activeUsers: 0,
  });

  // ── fetch helpers ─────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      // Use the backend route (requires service role key — safe on server)
      const res = await fetch(`${API}/api/users/admin/all`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data || []);

      const active = (data || []).filter(
        (u) => u.subscription_status === "active",
      ).length;
      const pool = active * 19;
      setStats({
        totalPool: pool,
        charityTotal: pool * 0.1,
        activeUsers: active,
      });
    } catch (err) {
      setUsersToast({
        msg: `Failed to load users: ${err.message}`,
        type: "error",
      });
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const fetchCharities = useCallback(async () => {
    setCharLoading(true);
    try {
      const { data, error } = await supabase
        .from("charities")
        .select("*")
        .order("name");
      if (error) throw error;
      setCharities(data || []);
    } catch (err) {
      setCharToast({
        msg: `Failed to load charities: ${err.message}`,
        type: "error",
      });
    } finally {
      setCharLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchCharities();
  }, [fetchUsers, fetchCharities]);

  // ── draw simulation ───────────────────────────────────────────────────────
  const runSimulation = async () => {
    setSimLoading(true);
    setSimResult(null);
    setDrawToast({ msg: "", type: "" });
    try {
      const res = await fetch(`${API}/api/draw/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: drawType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Simulation failed");
      setSimResult(data);
    } catch (err) {
      setDrawToast({ msg: err.message, type: "error" });
    } finally {
      setSimLoading(false);
    }
  };

  // ── publish draw ─────────────────────────────────────────────────────────
  const publishDraw = async () => {
    if (!simResult) return;
    setPublishLoading(true);
    setDrawToast({ msg: "", type: "" });
    try {
      const res = await fetch(`${API}/api/draw/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winningNumbers: simResult.winningNumbers,
          winners: simResult.winners,
          jackpotRollover: (simResult.winners?.tier5?.length ?? 0) === 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setDrawToast({
        msg: "Draw published! Winners have been notified.",
        type: "success",
      });
      setSimResult(null);
      fetchUsers(); // refresh stats
    } catch (err) {
      setDrawToast({ msg: err.message, type: "error" });
    } finally {
      setPublishLoading(false);
    }
  };

  // ── verify winner ─────────────────────────────────────────────────────────
  const handleVerify = async (userId, status) => {
    setUsersToast({ msg: "", type: "" });
    try {
      const res = await fetch(
        `${API}/api/users/admin/verify-winner/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setUsersToast({ msg: `Payout marked as ${status}.`, type: "success" });
      fetchUsers();
    } catch (err) {
      setUsersToast({ msg: err.message, type: "error" });
    }
  };

  // ── delete user ───────────────────────────────────────────────────────────
  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return;
    setUsersToast({ msg: "", type: "" });
    try {
      const res = await fetch(`${API}/api/users/admin/delete/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setUsersToast({ msg: "User deleted.", type: "success" });
      fetchUsers();
    } catch (err) {
      setUsersToast({ msg: err.message, type: "error" });
    }
  };

  // ── add charity ───────────────────────────────────────────────────────────
  const handleAddCharity = async () => {
    if (!newCharity.name.trim()) return;
    setAddingCharity(true);
    setCharToast({ msg: "", type: "" });
    try {
      const { error } = await supabase.from("charities").insert([
        {
          name: newCharity.name.trim(),
          description: newCharity.description.trim(),
          is_featured: newCharity.is_featured,
        },
      ]);
      if (error) throw error;
      setNewCharity({ name: "", description: "", is_featured: false });
      setCharToast({ msg: "Charity added.", type: "success" });
      fetchCharities();
    } catch (err) {
      setCharToast({ msg: err.message, type: "error" });
    } finally {
      setAddingCharity(false);
    }
  };

  // ── delete charity ────────────────────────────────────────────────────────
  const handleDeleteCharity = async (id, name) => {
    if (!window.confirm(`Delete charity "${name}"?`)) return;
    setCharToast({ msg: "", type: "" });
    try {
      const { error } = await supabase.from("charities").delete().eq("id", id);
      if (error) throw error;
      setCharToast({ msg: "Charity removed.", type: "success" });
      fetchCharities();
    } catch (err) {
      setCharToast({ msg: err.message, type: "error" });
    }
  };

  // ── toggle featured ───────────────────────────────────────────────────────
  const toggleFeatured = async (id, current) => {
    const { error } = await supabase
      .from("charities")
      .update({ is_featured: !current })
      .eq("id", id);
    if (!error) fetchCharities();
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="pt-28 pb-20 px-6 max-w-7xl mx-auto min-h-screen bg-[#020617] text-white">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase">
            Admin<span className="text-cyan-400">Portal</span>
          </h1>
          <p className="text-slate-500 font-bold text-xs tracking-[0.2em] mt-2 uppercase">
            System Oversight & Governance
          </p>
        </div>
        <div className="flex gap-10 items-end">
          <StatCard label="Active Subscribers" value={stats.activeUsers} />
          <div className="border-l border-slate-800 pl-10">
            <StatCard
              label="Total Prize Pool"
              value={`$${stats.totalPool}`}
              accent
            />
          </div>
          <div className="border-l border-slate-800 pl-10">
            <StatCard
              label="Charity Contributions"
              value={`$${stats.charityTotal.toFixed(2)}`}
            />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-10 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-fit">
        <Tab id="draws" active={activeTab === "draws"} onClick={setActiveTab}>
          Draws
        </Tab>
        <Tab id="users" active={activeTab === "users"} onClick={setActiveTab}>
          Users
        </Tab>
        <Tab
          id="charities"
          active={activeTab === "charities"}
          onClick={setActiveTab}
        >
          Charities
        </Tab>
      </div>

      <AnimatePresence mode="wait">
        {/* ════════════════ DRAWS TAB ════════════════ */}
        {activeTab === "draws" && (
          <motion.div
            key="draws"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Toast msg={drawToast.msg} type={drawToast.type} />

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Controls */}
              <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 h-fit space-y-6">
                <h2 className="text-xl font-bold italic">
                  Monthly Draw Engine
                </h2>

                {/* Draw type toggle */}
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">
                    Draw Logic
                  </p>
                  <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex">
                    <button
                      onClick={() => setDrawType("random")}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all ${
                        drawType === "random"
                          ? "bg-cyan-500 text-black"
                          : "text-slate-500 hover:text-white"
                      }`}
                    >
                      Random
                    </button>
                    <button
                      onClick={() => setDrawType("algorithmic")}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase transition-all ${
                        drawType === "algorithmic"
                          ? "bg-blue-600 text-white"
                          : "text-slate-500 hover:text-white"
                      }`}
                    >
                      Weighted
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    {drawType === "random"
                      ? "Standard lottery — fully random numbers."
                      : "Weighted by most/least frequent user scores."}
                  </p>
                </div>

                {/* Prize pool breakdown */}
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">
                    Pool Breakdown
                  </p>
                  {[
                    {
                      label: "5-Match Jackpot",
                      pct: "40%",
                      val: stats.totalPool * 0.4,
                    },
                    {
                      label: "4-Match",
                      pct: "35%",
                      val: stats.totalPool * 0.35,
                    },
                    {
                      label: "3-Match",
                      pct: "25%",
                      val: stats.totalPool * 0.25,
                    },
                  ].map((t) => (
                    <div key={t.label} className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        {t.label}{" "}
                        <span className="text-slate-600">({t.pct})</span>
                      </span>
                      <span className="font-black text-white">
                        ${t.val.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={runSimulation}
                  disabled={simLoading}
                  className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-all uppercase text-sm tracking-tighter disabled:opacity-50"
                >
                  {simLoading ? "Simulating…" : "Run Simulation"}
                </button>
              </div>

              {/* Results */}
              <div className="lg:col-span-2 space-y-6">
                {!simResult && !simLoading && (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-800 rounded-[2.5rem] py-20">
                    <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">
                      Run a simulation to preview results
                    </p>
                  </div>
                )}

                {simResult && (
                  <>
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 p-10 rounded-[2.5rem] border border-cyan-500/20">
                      <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-6">
                        Winning Combination
                      </p>

                      {/* Winning balls */}
                      <div className="flex gap-3 mb-8 flex-wrap">
                        {simResult.winningNumbers.map((n, i) => (
                          <div
                            key={i}
                            className="w-14 h-14 rounded-full bg-cyan-500 text-black flex items-center justify-center text-2xl font-black"
                          >
                            {n}
                          </div>
                        ))}
                      </div>

                      {/* Tier results */}
                      <div className="grid grid-cols-3 gap-4 font-mono">
                        {[
                          {
                            label: "5-Match Jackpot",
                            pct: "40%",
                            tier: "tier5",
                            rollover: true,
                          },
                          { label: "4-Match", pct: "35%", tier: "tier4" },
                          { label: "3-Match", pct: "25%", tier: "tier3" },
                        ].map((t, idx) => {
                          const winners = simResult.winners?.[t.tier] ?? [];
                          const prize =
                            stats.totalPool * [0.4, 0.35, 0.25][idx];
                          return (
                            <div
                              key={t.tier}
                              className="bg-slate-900/80 p-5 rounded-2xl border border-white/5"
                            >
                              <p className="text-[10px] text-slate-500 uppercase font-black mb-1">
                                {t.label} ({t.pct})
                              </p>
                              <p className="text-2xl font-black text-white">
                                ${prize.toLocaleString()}
                              </p>
                              <p
                                className={`text-[10px] mt-2 font-bold ${winners.length > 0 ? "text-green-400" : "text-slate-600"}`}
                              >
                                {winners.length} winner
                                {winners.length !== 1 ? "s" : ""}
                                {t.rollover && winners.length === 0 && (
                                  <span className="text-amber-400 ml-1">
                                    · Jackpot rolls over
                                  </span>
                                )}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Publish */}
                    <button
                      onClick={publishDraw}
                      disabled={publishLoading}
                      className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50"
                    >
                      {publishLoading
                        ? "Publishing…"
                        : "Publish Official Results"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════════════════ USERS TAB ════════════════ */}
        {activeTab === "users" && (
          <motion.div
            key="users"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Toast msg={usersToast.msg} type={usersToast.type} />

            {usersLoading ? (
              <div className="py-20 text-center text-slate-600 font-mono text-xs tracking-widest uppercase">
                Loading users…
              </div>
            ) : (
              <div className="bg-slate-900/30 rounded-[2.5rem] border border-slate-800 overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-900/80 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                      <th className="p-5">Email</th>
                      <th className="p-5">Subscription</th>
                      <th className="p-5">Charity %</th>
                      <th className="p-5">Scores (latest 5)</th>
                      <th className="p-5">Payout</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-slate-600 font-mono text-xs"
                        >
                          No users found
                        </td>
                      </tr>
                    )}
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-t border-slate-800 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-5 font-bold text-white text-sm">
                          {u.email}
                        </td>

                        <td className="p-5">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              u.subscription_status === "active"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {u.subscription_status || "inactive"}
                          </span>
                        </td>

                        <td className="p-5 text-slate-400 text-xs font-mono">
                          {u.charity_percent ? `${u.charity_percent}%` : "—"}
                        </td>

                        <td className="p-5 text-slate-500 text-xs font-mono">
                          {(u.golf_scores || []).length > 0
                            ? (u.golf_scores || [])
                                .slice(0, 5)
                                .map((s) => s.value ?? s)
                                .join(", ")
                            : "No scores"}
                        </td>

                        <td className="p-5">
                          {u.payout_status ? (
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                u.payout_status === "Paid"
                                  ? "bg-green-500/10 text-green-400"
                                  : u.payout_status === "Pending"
                                    ? "bg-amber-500/10 text-amber-400"
                                    : "bg-red-500/10 text-red-400"
                              }`}
                            >
                              {u.payout_status}
                            </span>
                          ) : (
                            <span className="text-slate-700 text-xs">—</span>
                          )}
                        </td>

                        <td className="p-5 text-right space-x-3 whitespace-nowrap">
                          {u.payout_status === "Pending" && (
                            <>
                              <button
                                onClick={() => handleVerify(u.id, "Paid")}
                                className="text-green-400 text-[10px] font-black uppercase hover:underline"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerify(u.id, "Rejected")}
                                className="text-red-400 text-[10px] font-black uppercase hover:underline"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="text-slate-600 text-[10px] font-black uppercase hover:text-red-400 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ════════════════ CHARITIES TAB ════════════════ */}
        {activeTab === "charities" && (
          <motion.div
            key="charities"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Toast msg={charToast.msg} type={charToast.type} />

            {/* Add form */}
            <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800 mb-8">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                Add New Charity
              </h3>
              <div className="grid md:grid-cols-4 gap-4 items-end">
                <input
                  type="text"
                  placeholder="Charity name *"
                  value={newCharity.name}
                  onChange={(e) =>
                    setNewCharity({ ...newCharity, name: e.target.value })
                  }
                  className="bg-slate-950 border border-slate-700 p-4 rounded-2xl text-white text-sm outline-none focus:border-cyan-500 transition-colors"
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
                  className="bg-slate-950 border border-slate-700 p-4 rounded-2xl text-white text-sm outline-none focus:border-cyan-500 transition-colors"
                />
                <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-400 font-bold pl-2">
                  <input
                    type="checkbox"
                    checked={newCharity.is_featured}
                    onChange={(e) =>
                      setNewCharity({
                        ...newCharity,
                        is_featured: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-cyan-500"
                  />
                  Feature on Homepage
                </label>
                <button
                  onClick={handleAddCharity}
                  disabled={addingCharity || !newCharity.name.trim()}
                  className="py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-all disabled:opacity-40 uppercase text-sm tracking-tight"
                >
                  {addingCharity ? "Adding…" : "Add Charity"}
                </button>
              </div>
            </div>

            {/* Charity grid */}
            {charLoading ? (
              <div className="py-12 text-center text-slate-600 font-mono text-xs tracking-widest uppercase">
                Loading charities…
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {charities.length === 0 && (
                  <div className="col-span-full py-16 text-center text-slate-600 font-mono text-xs">
                    No charities yet — add one above.
                  </div>
                )}
                {charities.map((c) => (
                  <div
                    key={c.id}
                    className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-black text-white uppercase italic text-sm flex-1 pr-4">
                        {c.name}
                      </h4>
                      <button
                        onClick={() => handleDeleteCharity(c.id, c.name)}
                        className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-black uppercase flex-shrink-0"
                      >
                        Delete
                      </button>
                    </div>
                    {c.description && (
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        {c.description}
                      </p>
                    )}
                    <button
                      onClick={() => toggleFeatured(c.id, c.is_featured)}
                      className={`text-[10px] px-3 py-1 rounded-full font-black uppercase transition-all ${
                        c.is_featured
                          ? "bg-cyan-500/20 text-cyan-400 hover:bg-red-500/20 hover:text-red-400"
                          : "bg-slate-800 text-slate-500 hover:bg-cyan-500/20 hover:text-cyan-400"
                      }`}
                    >
                      {c.is_featured ? "Featured ✓" : "Set as Featured"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;

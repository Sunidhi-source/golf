import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabaseClient";

const API = process.env.REACT_APP_API_URL;

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

const ScoreEditor = ({ user, onSaved, onCancel }) => {
  const [scores, setScores] = useState(
    (user.golf_scores || []).map((s) => ({
      value: s.value ?? s,
      date: s.date || "",
    })),
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const updateScore = (idx, field, val) => {
    const updated = [...scores];
    updated[idx] = { ...updated[idx], [field]: val };
    setScores(updated);
  };

  const removeScore = (idx) => setScores(scores.filter((_, i) => i !== idx));

  const addScore = () => {
    if (scores.length >= 5) return;
    setScores([
      ...scores,
      { value: "", date: new Date().toISOString().split("T")[0] },
    ]);
  };

  const handleSave = async () => {
    setErr("");
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/users/admin/edit-scores/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      onSaved(data.scores);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 p-6 bg-slate-950 border border-cyan-500/20 rounded-2xl">
      <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-4">
        Edit Scores for {user.email}
      </p>
      {err && <p className="text-red-400 text-xs mb-3">{err}</p>}
      <div className="space-y-2 mb-4">
        {scores.map((s, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              type="number"
              min="1"
              max="45"
              value={s.value}
              onChange={(e) => updateScore(i, "value", e.target.value)}
              placeholder="Score 1-45"
              className="w-24 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm outline-none focus:border-cyan-500"
            />
            <input
              type="date"
              value={s.date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => updateScore(i, "date", e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 p-2 rounded-lg text-white text-sm outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => removeScore(i)}
              className="text-red-400 text-xs font-black hover:text-red-300 px-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-3">
        {scores.length < 5 && (
          <button
            onClick={addScore}
            className="text-xs text-cyan-400 font-black uppercase border border-cyan-500/30 px-4 py-2 rounded-lg hover:bg-cyan-500/10"
          >
            + Add Score
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-cyan-500 text-black text-xs font-black rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Scores"}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-slate-800 text-slate-300 text-xs font-black rounded-lg hover:bg-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════════
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
  const [editingScoresFor, setEditingScoresFor] = useState(null);

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

  const [drawHistory, setDrawHistory] = useState([]);

  const [stats, setStats] = useState({
    totalPool: 0,
    charityTotal: 0,
    activeUsers: 0,
  });

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
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
        charityTotal: (data || [])
          .reduce((sum, u) => {
            if (u.subscription_status === "active") {
              const pct = parseInt(u.charity_percent || 10, 10) / 100;
              return sum + 19 * pct;
            }
            return sum;
          }, 0)
          .toFixed(2),
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

  const fetchDrawHistory = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/draw/history`);
      if (!res.ok) return;
      const data = await res.json();
      setDrawHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("draw history fetch failed:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchCharities();
    fetchDrawHistory();
  }, [fetchUsers, fetchCharities, fetchDrawHistory]);

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

  const publishDraw = async () => {
    if (!simResult) return;
    setPublishLoading(true);
    setDrawToast({ msg: "", type: "" });
    try {
      const jackpotRollover = (simResult.winners?.tier5?.length ?? 0) === 0;
      const jackpotAmount = jackpotRollover
        ? stats.totalPool * 0.4 + (simResult.rolledOverJackpot || 0)
        : 0;

      const res = await fetch(`${API}/api/draw/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          winningNumbers: simResult.winningNumbers,
          winners: simResult.winners,
          jackpotRollover,
          jackpotAmount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publish failed");
      setDrawToast({
        msg: "Draw published! Winners have been notified.",
        type: "success",
      });
      setSimResult(null);
      fetchUsers();
      fetchDrawHistory();
    } catch (err) {
      setDrawToast({ msg: err.message, type: "error" });
    } finally {
      setPublishLoading(false);
    }
  };

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
      setUsersToast({ msg: `Status updated to ${status}.`, type: "success" });
      fetchUsers();
    } catch (err) {
      setUsersToast({ msg: err.message, type: "error" });
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Permanently delete ${email}? This cannot be undone.`))
      return;
    try {
      const res = await fetch(`${API}/api/users/admin/delete/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setUsersToast({ msg: `${email} deleted.`, type: "success" });
      fetchUsers();
    } catch (err) {
      setUsersToast({ msg: err.message, type: "error" });
    }
  };

  const handleAddCharity = async () => {
    if (!newCharity.name.trim()) return;
    setAddingCharity(true);
    try {
      const res = await fetch(`${API}/api/charities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCharity),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Add failed");
      setNewCharity({ name: "", description: "", is_featured: false });
      setCharToast({ msg: "Charity added successfully.", type: "success" });
      fetchCharities();
    } catch (err) {
      setCharToast({ msg: err.message, type: "error" });
    } finally {
      setAddingCharity(false);
    }
  };

  const handleDeleteCharity = async (charityId, name) => {
    if (!window.confirm(`Delete charity "${name}"?`)) return;
    try {
      const res = await fetch(`${API}/api/charities/${charityId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCharToast({ msg: "Charity deleted.", type: "success" });
      fetchCharities();
    } catch (err) {
      setCharToast({ msg: err.message, type: "error" });
    }
  };

  const toggleFeatured = async (charityId, currentState) => {
    try {
      const res = await fetch(`${API}/api/charities/${charityId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_featured: !currentState }),
      });
      if (!res.ok) throw new Error("Update failed");
      fetchCharities();
    } catch (err) {
      setCharToast({ msg: err.message, type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-end gap-6 mb-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-2">
              Admin Portal
            </p>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase">
              Control Centre
            </h1>
          </div>
          <div className="flex gap-10">
            <StatCard label="Active Users" value={stats.activeUsers} accent />
            <StatCard
              label="Prize Pool"
              value={`$${stats.totalPool.toLocaleString()}`}
            />
            <StatCard label="Charity Total" value={`$${stats.charityTotal}`} />
          </div>
        </div>

        <div className="flex gap-2 mb-10 border-b border-slate-800 pb-4 overflow-x-auto">
          {[
            { id: "draws", label: "Draw Engine" },
            { id: "users", label: "Users" },
            { id: "charities", label: "Charities" },
            { id: "reports", label: "Reports" },
          ].map((t) => (
            <Tab
              key={t.id}
              id={t.id}
              active={activeTab === t.id}
              onClick={setActiveTab}
            >
              {t.label}
            </Tab>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "draws" && (
            <motion.div
              key="draws"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Toast msg={drawToast.msg} type={drawToast.type} />
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                    Configure Draw
                  </h3>
                  <div className="space-y-4 mb-8">
                    {["random", "algorithmic"].map((t) => (
                      <label
                        key={t}
                        className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition-all ${
                          drawType === t
                            ? "border-cyan-500/50 bg-cyan-500/5"
                            : "border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="drawType"
                          value={t}
                          checked={drawType === t}
                          onChange={(e) => setDrawType(e.target.value)}
                          className="mt-1 accent-cyan-500"
                        />
                        <div>
                          <p className="text-sm font-black uppercase text-white">
                            {t === "random"
                              ? "Random Draw"
                              : "Algorithmic Draw"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {t === "random"
                              ? "Standard lottery-style — equal chance for all numbers."
                              : "Weighted by most/least frequent user scores from this month."}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={runSimulation}
                    disabled={simLoading}
                    className="w-full py-5 bg-slate-800 text-white font-black rounded-2xl uppercase tracking-widest text-sm hover:bg-slate-700 transition-all disabled:opacity-50"
                  >
                    {simLoading ? "Running Simulation…" : "Run Simulation"}
                  </button>
                </div>

                <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                    Simulation Results
                  </h3>

                  {!simResult ? (
                    <div className="flex-1 py-20 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
                      Run a simulation to see results here
                    </div>
                  ) : (
                    <>
                      <div className="mb-6">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                          Winning Numbers
                        </p>
                        <div className="flex gap-3 flex-wrap">
                          {simResult.winningNumbers.map((n, i) => (
                            <div
                              key={i}
                              className="w-12 h-12 rounded-full bg-cyan-500 text-black flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                            >
                              {n}
                            </div>
                          ))}
                        </div>
                        {simResult.rolledOverJackpot > 0 && (
                          <p className="text-amber-400 text-xs font-bold mt-3">
                            + Jackpot rollover included: $
                            {simResult.rolledOverJackpot.toLocaleString()}
                          </p>
                        )}
                      </div>

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
                          const w = simResult.winners?.[t.tier] ?? [];
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
                                className={`text-[10px] mt-2 font-bold ${
                                  w.length > 0
                                    ? "text-green-400"
                                    : "text-slate-600"
                                }`}
                              >
                                {w.length} winner{w.length !== 1 ? "s" : ""}
                                {t.rollover && w.length === 0 && (
                                  <span className="text-amber-400 ml-1">
                                    · Rolls over
                                  </span>
                                )}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={publishDraw}
                        disabled={publishLoading}
                        className="mt-6 w-full py-5 bg-cyan-500 text-black font-black rounded-2xl uppercase tracking-widest text-sm hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50"
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
                  <table className="w-full text-left min-w-[900px]">
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
                        <React.Fragment key={u.id}>
                          <tr className="border-t border-slate-800 hover:bg-white/[0.02] transition-colors">
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
                              {u.charity_percent
                                ? `${u.charity_percent}%`
                                : "—"}
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
                                <span className="text-slate-700 text-xs">
                                  —
                                </span>
                              )}
                            </td>
                            <td className="p-5 text-right space-x-3 whitespace-nowrap">
                              <button
                                onClick={() =>
                                  setEditingScoresFor(
                                    editingScoresFor?.id === u.id ? null : u,
                                  )
                                }
                                className="text-cyan-400 text-[10px] font-black uppercase hover:underline"
                              >
                                {editingScoresFor?.id === u.id
                                  ? "Close"
                                  : "Edit Scores"}
                              </button>
                              {u.payout_status === "Pending" && (
                                <>
                                  <button
                                    onClick={() => handleVerify(u.id, "Paid")}
                                    className="text-green-400 text-[10px] font-black uppercase hover:underline"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleVerify(u.id, "Rejected")
                                    }
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
                          {editingScoresFor?.id === u.id && (
                            <tr className="border-t border-cyan-500/10">
                              <td colSpan={6} className="px-5 pb-5">
                                <ScoreEditor
                                  user={u}
                                  onSaved={(newScores) => {
                                    setUsers((prev) =>
                                      prev.map((usr) =>
                                        usr.id === u.id
                                          ? { ...usr, golf_scores: newScores }
                                          : usr,
                                      ),
                                    );
                                    setEditingScoresFor(null);
                                    setUsersToast({
                                      msg: "Scores updated successfully.",
                                      type: "success",
                                    });
                                  }}
                                  onCancel={() => setEditingScoresFor(null)}
                                />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "charities" && (
            <motion.div
              key="charities"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Toast msg={charToast.msg} type={charToast.type} />
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

          {activeTab === "reports" && (
            <motion.div
              key="reports"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {[
                  { label: "Total Users", value: users.length },
                  { label: "Active Subscribers", value: stats.activeUsers },
                  {
                    label: "Total Prize Pool",
                    value: `$${stats.totalPool.toLocaleString()}`,
                  },
                  {
                    label: "Total Charity Raised",
                    value: `$${stats.charityTotal}`,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800"
                  >
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                      {s.label}
                    </p>
                    <p className="text-3xl font-black text-white">{s.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">
                  Draw History
                </h3>
                {drawHistory.length === 0 ? (
                  <p className="text-slate-600 font-mono text-xs text-center py-10">
                    No draws published yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {drawHistory.map((d) => (
                      <div
                        key={d.id}
                        className="p-5 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">
                            {new Date(d.published_at).toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {(d.winning_numbers || []).map((n, i) => (
                              <span
                                key={i}
                                className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-black text-white"
                              >
                                {n}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs font-mono text-slate-400 flex-wrap">
                          <span>
                            5-Match:{" "}
                            <strong className="text-white">
                              {(d.tier5_winners || []).length}
                            </strong>
                          </span>
                          <span>
                            4-Match:{" "}
                            <strong className="text-white">
                              {(d.tier4_winners || []).length}
                            </strong>
                          </span>
                          <span>
                            3-Match:{" "}
                            <strong className="text-white">
                              {(d.tier3_winners || []).length}
                            </strong>
                          </span>
                          {d.jackpot_rollover && (
                            <span className="text-amber-400 font-bold">
                              Jackpot rolled over
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminPanel;

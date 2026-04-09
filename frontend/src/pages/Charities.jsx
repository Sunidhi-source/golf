import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const API = process.env.REACT_APP_API_URL;

const Charities = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/charities`)
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setCharities(list);
        setFeatured(list.find((c) => c.is_featured) || null);
      })
      .catch(() => setCharities([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = charities.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-32 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-4">
            Charitable Partners
          </p>
          <h1 className="text-5xl font-black italic tracking-tighter mb-6">
            CHOOSE YOUR <span className="text-cyan-400">CAUSE</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">
            Every subscription automatically routes a minimum of 10% to your
            chosen charity. You pick who benefits — and you can always give
            more.
          </p>
        </motion.div>

        {featured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 p-10 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border border-cyan-500/20 rounded-[2.5rem]"
          >
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-3">
                  Spotlight Charity
                </p>
                <h2 className="text-3xl font-black italic tracking-tighter text-white mb-3">
                  {featured.name}
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  {featured.description || "No description provided."}
                </p>
              </div>
              <Link to="/signup">
                <button className="bg-cyan-500 text-black px-8 py-4 rounded-2xl font-black hover:bg-cyan-400 transition-all whitespace-nowrap">
                  Support This Cause →
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search charities…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 p-4 pl-12 rounded-2xl text-white placeholder-slate-600 outline-none focus:border-cyan-500 transition-all"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-sm">
              🔍
            </span>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>
          {search && (
            <p className="text-slate-500 text-xs mt-3 font-mono">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
              {search}"
            </p>
          )}
        </div>

        {loading && (
          <div className="py-20 text-center text-slate-600 font-mono text-xs uppercase tracking-widest">
            Loading charities…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem]">
            <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">
              {search
                ? "No charities match your search."
                : "No charities listed yet."}
            </p>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-8 rounded-[2.5rem] border flex flex-col gap-4 ${
                  c.is_featured
                    ? "border-cyan-500/30 bg-cyan-500/5"
                    : "border-slate-800 bg-slate-900/30"
                }`}
              >
                {c.is_featured && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                    ★ Featured
                  </span>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white italic tracking-tight mb-3">
                    {c.name}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {c.description || "Supporting meaningful change."}
                  </p>
                </div>

                {c.upcoming_events && c.upcoming_events.length > 0 && (
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      Upcoming Events
                    </p>
                    <ul className="space-y-1">
                      {c.upcoming_events.slice(0, 2).map((ev, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-slate-400 flex items-center gap-2"
                        >
                          <span className="text-cyan-400">→</span>
                          {ev}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link to="/signup">
                  <button className="w-full py-3 bg-slate-800 hover:bg-cyan-500 hover:text-black text-white text-sm font-black rounded-2xl transition-all uppercase tracking-tight">
                    Support {c.name.split(" ")[0]}
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && (
          <div className="mt-16 text-center">
            <p className="text-slate-500 mb-4 text-sm">
              Ready to start making an impact?
            </p>
            <Link to="/pricing">
              <button className="bg-cyan-500 text-black px-12 py-4 rounded-2xl font-black text-lg hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                Subscribe & Choose Your Cause
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Charities;

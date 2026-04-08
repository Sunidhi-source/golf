import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#020617] text-white pt-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-5xl mx-auto py-20 relative z-10"
      >
        <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest mb-8">
          Golf · Charity · Monthly Prize Draws
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter italic">
          PLAY FOR <span className="text-cyan-400">GOOD.</span>
          <br />
          WIN FOR{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            ALL.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
          The modern golf subscription that fuels world-changing charities while
          giving you a chance at massive monthly prize pools.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/pricing">
            <button className="bg-cyan-500 text-black px-12 py-5 rounded-2xl font-black text-xl hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] uppercase tracking-tight">
              Start Your Impact
            </button>
          </Link>
          <a href="#how-it-works">
            <button className="bg-white/5 text-white border border-white/10 px-12 py-5 rounded-2xl font-black text-xl hover:bg-white/10 transition-all uppercase tracking-tight">
              How It Works
            </button>
          </a>
        </div>
      </motion.section>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-10 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2.5rem] hover:border-cyan-500/50 transition-colors"
        >
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
            <span className="text-cyan-400 font-bold text-lg">❤️</span>
          </div>
          <h3 className="text-white text-2xl font-black mb-4 tracking-tight">
            Min 10% to Charity
          </h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            Every subscription auto-allocates at least 10% to a charity of your
            choice. You choose who benefits — and you can give more.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-10 bg-slate-900/60 backdrop-blur-md border-2 border-cyan-500/30 rounded-[2.5rem] shadow-2xl scale-105 relative"
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] px-4 py-1 rounded-full font-black uppercase tracking-widest">
            Reward Engine
          </div>
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
            <span className="text-cyan-400 font-bold text-lg">🎯</span>
          </div>
          <h3 className="text-cyan-400 text-2xl font-black mb-4 tracking-tight">
            Monthly Prize Draws
          </h3>
          <p className="text-slate-300 leading-relaxed font-medium">
            Three tiers of prize pools: 5-Match Jackpot (40%), 4-Match (35%),
            and 3-Match (25%). Jackpot rolls over if unclaimed.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-10 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2.5rem] hover:border-cyan-500/50 transition-colors"
        >
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-lg">⛳</span>
          </div>
          <h3 className="text-white text-2xl font-black mb-4 tracking-tight">
            Simple Score Tracking
          </h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            Enter your Stableford scores (1–45). We keep your latest 5 and
            automatically enter you into each month's draw.
          </p>
        </motion.div>
      </div>

      <section
        id="how-it-works"
        className="max-w-6xl mx-auto pb-24 relative z-10"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 text-center">
          How It Works
        </p>
        <h2 className="text-4xl font-black text-center mb-16 italic tracking-tighter">
          THREE STEPS TO <span className="text-cyan-400">IMPACT</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Subscribe & Choose",
              desc: "Pick a monthly or yearly plan. Select a charity to support and set your contribution percentage (minimum 10%).",
            },
            {
              step: "02",
              title: "Enter Your Scores",
              desc: "Log your Stableford golf scores after each round. Your latest 5 scores form your entry into every monthly draw.",
            },
            {
              step: "03",
              title: "Win & Give Back",
              desc: "Match 3, 4, or all 5 drawn numbers to win your tier of the prize pool — while your charity receives funds every month.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-10 bg-slate-900/30 border border-slate-800 rounded-[2.5rem]"
            >
              <div className="text-[80px] font-black text-slate-800/50 leading-none mb-4 select-none">
                {item.step}
              </div>
              <h3 className="text-xl font-black uppercase text-white mb-3">
                {item.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto pb-24 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 text-center">
          Prize Structure
        </p>
        <h2 className="text-4xl font-black text-center mb-12 italic tracking-tighter">
          THREE WAYS TO <span className="text-cyan-400">WIN</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              match: "5-Number Match",
              share: "40%",
              label: "Jackpot",
              rollover: true,
              color: "cyan",
            },
            {
              match: "4-Number Match",
              share: "35%",
              label: "Major Prize",
              rollover: false,
              color: "blue",
            },
            {
              match: "3-Number Match",
              share: "25%",
              label: "Prize",
              rollover: false,
              color: "slate",
            },
          ].map((tier, i) => (
            <div
              key={i}
              className={`p-8 rounded-[2.5rem] border ${
                i === 0
                  ? "border-cyan-500/30 bg-cyan-500/5"
                  : "border-slate-800 bg-slate-900/30"
              }`}
            >
              <p
                className={`text-[10px] font-black uppercase tracking-widest mb-2 ${i === 0 ? "text-cyan-400" : "text-slate-500"}`}
              >
                {tier.label}
              </p>
              <h3 className="text-2xl font-black text-white mb-2">
                {tier.match}
              </h3>
              <p
                className={`text-5xl font-black mb-4 ${i === 0 ? "text-cyan-400" : "text-white"}`}
              >
                {tier.share}
              </p>
              <p className="text-slate-500 text-sm">
                of the monthly prize pool
              </p>
              {tier.rollover && (
                <p className="text-amber-400 text-xs font-bold mt-3 uppercase tracking-widest">
                  ↑ Jackpot rolls over if unclaimed
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <FeaturedCharity />

      <section className="max-w-4xl mx-auto pb-32 relative z-10 text-center">
        <h2 className="text-5xl font-black italic tracking-tighter mb-6">
          READY TO PLAY FOR <span className="text-cyan-400">GOOD?</span>
        </h2>
        <p className="text-slate-400 mb-10 text-lg max-w-xl mx-auto">
          Join a community of golfers making a real difference. Monthly from
          $19.
        </p>
        <Link to="/pricing">
          <button className="bg-cyan-500 text-black px-14 py-6 rounded-2xl font-black text-xl hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_40px_rgba(6,182,212,0.4)] uppercase tracking-tight">
            Start Your Impact Today
          </button>
        </Link>
      </section>
    </div>
  );
};

const FeaturedCharity = () => {
  const [featured, setFeatured] = React.useState(null);
  const API = process.env.REACT_APP_API_URL;

  React.useEffect(() => {
    fetch(`${API}/api/charities/featured`)
      .then((r) => r.json())
      .then((data) => setFeatured(data[0] || null))
      .catch(() => {});
  }, [API]);

  if (!featured) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="max-w-6xl mx-auto pb-20 relative z-10"
    >
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 text-center">
        Spotlight Charity
      </p>
      <div className="p-10 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 border border-cyan-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <h3 className="text-3xl font-black text-white mb-3">
            {featured.name}
          </h3>
          <p className="text-slate-400 leading-relaxed">
            {featured.description}
          </p>
        </div>
        <Link to="/pricing">
          <button className="bg-cyan-500 text-black px-8 py-4 rounded-2xl font-black hover:bg-cyan-400 transition-all whitespace-nowrap">
            Support This Cause
          </button>
        </Link>
      </div>
    </motion.div>
  );
};

export default Home;

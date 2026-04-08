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

        <Link to="/pricing">
          <button className="bg-cyan-500 text-black px-12 py-5 rounded-2xl font-black text-xl hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] uppercase tracking-tight">
            Start Your Impact
          </button>
        </Link>
      </motion.section>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-32 relative z-10">
        <div className="p-10 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2.5rem] hover:border-cyan-500/50 transition-colors">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-6">
            <span className="text-cyan-400 font-bold">10%</span>
          </div>
          <h3 className="text-white text-2xl font-black mb-4 tracking-tight">
            Minimum Impact
          </h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            Every subscription goes directly to a charity of your choice.
          </p>
        </div>

        <div className="p-10 bg-slate-900/60 backdrop-blur-md border-2 border-cyan-500/30 rounded-[2.5rem] shadow-2xl scale-105 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-[10px] px-4 py-1 rounded-full font-black uppercase tracking-widest">
            Reward Engine
          </div>
          <h3 className="text-cyan-400 text-2xl font-black mb-4 tracking-tight">
            Monthly Draws
          </h3>
          <p className="text-slate-300 leading-relaxed font-medium">
            Three tiers of prize pools including a massive 5-Match Jackpot.
          </p>
        </div>

        <div className="p-10 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-[2.5rem] hover:border-cyan-500/50 transition-colors">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white font-bold">5</span>
          </div>
          <h3 className="text-white text-2xl font-black mb-4 tracking-tight">
            Rolling Scores
          </h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            Simple 5-score tracking system to enter the rewards engine.
          </p>
        </div>
      </div>

      <FeaturedCharity />
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
      animate={{ opacity: 1, y: 0 }}
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

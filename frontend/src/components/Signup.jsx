import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Pricing from "./Pricing";

const Signup = () => {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    plan: "monthly",
    charityId: "",
    percent: 10,
  });

  useEffect(() => {
    fetch("https://golf-u6ol.onrender.com/api/charities")
      .then((res) => res.json())
      .then((data) => setCharities(data))
      .catch((err) => console.error("Error fetching charities:", err));
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.charityId) return alert("Please select a charity first.");

    setLoading(true);
    try {
      const response = await fetch(
        "https://golf-u6ol.onrender.com/api/payments/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        alert("Failed to create payment session.");
      }
    } catch (err) {
      console.error("Signup failed", err);
      alert("Something went wrong connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 bg-[#020617] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full -top-24 -left-24 pointer-events-none" />

      <div className="text-center mb-10 z-10">
        <h2 className="text-5xl font-black text-white mb-3 tracking-tight">
          {step === 1 ? "Choose Your " : "Finalize Your "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic tracking-tighter">
            {step === 1 ? "IMPACT" : "DETAILS"}
          </span>
        </h2>
        <p className="text-slate-400 font-medium max-w-md mx-auto">
          {step === 1
            ? "Select a plan to start fueling change through the game you love."
            : "Tell us who you're playing for and confirm your contribution."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-5xl z-10"
          >
            <Pricing
              selectedPlan={formData.plan}
              onPlanChange={(p) => {
                setFormData({ ...formData, plan: p });
                setStep(2);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-lg w-full p-10 bg-slate-900/50 backdrop-blur-2xl rounded-[3rem] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
          >
            <form onSubmit={handleSignup} className="space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-[0.2em]">
                  Account Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="Enter your email"
                  className="w-full p-4 bg-slate-950/50 border border-slate-700 rounded-2xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-white transition-all placeholder:text-slate-600"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-[0.2em]">
                  Select Charity
                </label>
                <div className="relative">
                  <select
                    required
                    className="w-full p-4 bg-slate-950/50 border border-slate-700 rounded-2xl outline-none focus:border-cyan-500 text-white transition-all appearance-none cursor-pointer"
                    onChange={(e) =>
                      setFormData({ ...formData, charityId: e.target.value })
                    }
                  >
                    <option value="" className="bg-slate-900 text-slate-500">
                      Choose a Charity to Support
                    </option>
                    {charities.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="bg-slate-900 text-white"
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    ▼
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-950/50 rounded-3xl border border-slate-800/50 group">
                <div className="flex justify-between items-center mb-6">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.15em]">
                    Your Donation %
                  </label>
                  <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    {formData.percent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 transition-all"
                  onChange={(e) =>
                    setFormData({ ...formData, percent: e.target.value })
                  }
                />
                <div className="flex justify-between mt-3">
                  <span className="text-[10px] text-slate-600 font-bold uppercase">
                    Min (10%)
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold uppercase">
                    Max (100%)
                  </span>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-8 py-4 bg-slate-800/50 text-slate-300 font-bold rounded-2xl hover:bg-slate-800 hover:text-white transition-all"
                >
                  Back
                </button>
                <button
                  disabled={loading}
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-black rounded-2xl hover:shadow-[0_0_25px_rgba(34,211,238,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? "PROCESSING..." : "GET STARTED"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Signup;

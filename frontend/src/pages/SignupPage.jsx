import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Pricing from "../components/Pricing";
import Signup from "../components/Signup";

const SignupPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <div className="pt-32 pb-20 bg-[#020617] min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-cyan-500/10 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md mx-auto mb-12 px-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${!selectedPlan ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.6)]" : "bg-slate-800 text-slate-400"}`}
            >
              1
            </div>
            <span
              className={`text-[10px] uppercase tracking-widest font-bold ${!selectedPlan ? "text-cyan-400" : "text-slate-600"}`}
            >
              Plan
            </span>
          </div>

          <div
            className={`flex-1 h-[2px] mx-4 transition-colors duration-500 ${selectedPlan ? "bg-cyan-500" : "bg-slate-800"}`}
          />

          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${selectedPlan ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(34,211,238,0.6)]" : "bg-slate-800 text-slate-400"}`}
            >
              2
            </div>
            <span
              className={`text-[10px] uppercase tracking-widest font-bold ${selectedPlan ? "text-cyan-400" : "text-slate-600"}`}
            >
              Details
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-4">
        <AnimatePresence mode="wait">
          {!selectedPlan ? (
            <motion.div
              key="pricing-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Pricing onSelectPlan={(plan) => setSelectedPlan(plan)} />
            </motion.div>
          ) : (
            <motion.div
              key="signup-step"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
              className="flex justify-center"
            >
              <Signup plan={selectedPlan} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-20 text-center opacity-30">
        <p className="text-white font-black italic tracking-tighter text-xl">
          HEROES <span className="text-cyan-500 text-sm">PRO</span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;

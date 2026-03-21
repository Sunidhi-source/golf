import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    const ADMIN_EMAIL = "admin@123.com";

    try {
      const { data, error } = isSignup
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      if (isSignup) {
        navigate("/dashboard");
      } else {
        if (data.user.email === ADMIN_EMAIL) {
          console.log("Admin Access Granted");
          navigate("/admin");
        } else {
          console.log("Standard User Access");
          navigate("/dashboard");
        }
      }
    } catch (err) {
      alert("Authentication failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] px-4 selection:bg-cyan-500/30">
      <div className="absolute w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-10"
      >
        <div className="text-center mb-10">
          <h2 className="text-4xl font-black mb-3 tracking-tight text-white">
            {isSignup ? "Join the " : "Welcome "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent italic tracking-tighter">
              HEROES
            </span>
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            {isSignup
              ? "Start your charitable journey today."
              : "Log in to track your impact."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-widest">
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              required
              className="w-full p-4 bg-slate-950/50 border border-slate-700 rounded-2xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-white transition-all placeholder:text-slate-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 ml-2 uppercase tracking-widest">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="w-full p-4 bg-slate-950/50 border border-slate-700 rounded-2xl outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 text-white transition-all placeholder:text-slate-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            disabled={loading}
            className="w-full relative group overflow-hidden py-4 bg-gradient-to-br from-cyan-400 to-blue-600 text-black font-black rounded-2xl hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading
                ? "Authorizing..."
                : isSignup
                  ? "Create Hero Account"
                  : "Enter Portal"}
            </span>
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0f172a] px-2 text-slate-500">
              Identity Verification
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsSignup(!isSignup)}
          className="w-full text-sm font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          {isSignup
            ? "Already have an account? Log in"
            : "New here? Create an account"}
        </button>
      </motion.div>
    </div>
  );
};

export default Login;

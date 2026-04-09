import React from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";

const FEATURES = [
  "Monthly prize draw entry",
  "Stableford score tracking",
  "Charity contribution (min 10%)",
  "Draw history & results",
  "Winner verification system",
];

const Pricing = () => {
  const handleSubscribe = async (planType) => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        return (window.location.href = "/login");
      }

      const API = process.env.REACT_APP_API_URL;

      const response = await fetch(`${API}/api/payments/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // FIXED: Pass JWT so backend can verify the caller
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planType,
          userId: session.user.id,
          email: session.user.email,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(`Payment error: ${data.error || "Please try again."}`);
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Could not connect to the payment server. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white pt-32 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-4 text-center">
          Choose Your Plan
        </p>
        <h1 className="text-4xl font-black text-center mb-4 italic tracking-tighter">
          SELECT YOUR <span className="text-cyan-400">IMPACT</span>
        </h1>
        <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
          Every plan includes full platform access, monthly draw entry, and a
          minimum 10% contribution to your chosen charity.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Monthly */}
          <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] hover:border-cyan-400/50 transition-all group flex flex-col">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Monthly
              </p>
              <h3 className="text-2xl font-bold mb-1">Monthly Impact</h3>
              <p className="text-5xl font-black my-6 text-cyan-400">
                $19<span className="text-lg text-slate-500">/mo</span>
              </p>
              <ul className="space-y-3 mb-8">
                {FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-slate-400"
                  >
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 text-[10px]">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("monthly")}
              className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-colors mt-auto"
            >
              Start Monthly
            </button>
          </div>

          {/* Yearly */}
          <div className="p-10 bg-slate-900/50 border-2 border-cyan-500/30 rounded-[2.5rem] relative overflow-hidden group flex flex-col shadow-[0_0_40px_rgba(6,182,212,0.08)]">
            <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] px-4 py-1 rounded-bl-xl uppercase font-black">
              Best Value
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-2">
                Yearly
              </p>
              <h3 className="text-2xl font-bold mb-1">Yearly Impact</h3>
              <p className="text-5xl font-black my-6 text-white">
                $180
                <span className="text-lg text-slate-500">/yr</span>
                <span className="ml-3 text-sm font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full">
                  Save $48
                </span>
              </p>
              <ul className="space-y-3 mb-8">
                {FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-slate-300"
                  >
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400 text-[10px]">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm text-cyan-400 font-bold">
                  <span className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0 text-[10px]">
                    ✓
                  </span>
                  2 months free vs monthly
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleSubscribe("yearly")}
              className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-colors mt-auto"
            >
              Start Yearly — Save $48
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm">
          Want to choose your charity first?{" "}
          <Link
            to="/charities"
            className="text-cyan-400 hover:underline font-bold"
          >
            Browse charities →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Pricing;

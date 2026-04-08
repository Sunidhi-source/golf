import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const API = process.env.REACT_APP_API_URL;

const Pricing = () => {
  const navigate = useNavigate();
  const [charities, setCharities] = useState([]);
  const [charityId, setCharityId] = useState("");
  const [percent, setPercent] = useState(10);
  const [loadingPlan, setLoadingPlan] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/charities`)
      .then((r) => r.json())
      .then((d) => setCharities(d || []))
      .catch(() => {});
  }, []);

  const handleSubscribe = async (planType) => {
    const {
      data: { session },
      error: sErr,
    } = await supabase.auth.getSession();
    if (sErr || !session) {
      navigate("/login");
      return;
    }

    if (!charityId) {
      alert("Please select a charity before subscribing.");
      return;
    }

    setLoadingPlan(planType);
    try {
      const res = await fetch(`${API}/api/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planType,
          userId: session.user.id,
          email: session.user.email,
          charityId, // required — webhook uses this to link charity to profile
          percent, // required — webhook stores contribution %
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(`Payment error: ${data.error || "Please try again."}`);
      }
    } catch {
      alert("Could not connect to payment service. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-center mb-3 italic tracking-tighter">
          SELECT YOUR <span className="text-cyan-400">IMPACT</span>
        </h1>
        <p className="text-slate-500 text-center mb-12 font-medium">
          Every plan includes monthly draw entry, score tracking, and a
          charitable contribution.
        </p>

        {/* Step 1 — Charity */}
        <div className="mb-10 p-8 bg-slate-900/50 border border-slate-800 rounded-[2.5rem]">
          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-5">
            Step 1 · Choose Your Charity
          </p>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="relative">
              <select
                value={charityId}
                onChange={(e) => setCharityId(e.target.value)}
                className="w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl outline-none focus:border-cyan-500 text-white appearance-none cursor-pointer text-sm"
              >
                <option value="">Select a charity to support</option>
                {charities.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900">
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-xs">
                ▼
              </div>
            </div>
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Your Contribution
                </span>
                <span className="text-xl font-black text-cyan-400">
                  {percent}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-slate-600 font-bold">
                  Min 10%
                </span>
                <span className="text-[10px] text-slate-600 font-bold">
                  Max 100%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 — Plan */}
        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-5">
          Step 2 · Pick Your Plan
        </p>
        <div className="grid md:grid-cols-2 gap-7">
          {/* Monthly */}
          <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] hover:border-cyan-400/50 transition-all">
            <h3 className="text-2xl font-bold">Monthly Impact</h3>
            <p className="text-5xl font-black my-6 text-cyan-400">
              $19<span className="text-lg text-slate-500">/mo</span>
            </p>
            <ul className="space-y-2 text-slate-400 text-sm mb-8">
              <li>✓ Monthly draw entry</li>
              <li>✓ Score tracking (rolling 5)</li>
              <li>✓ Charity contribution ({percent}%)</li>
              <li>✓ Full dashboard access</li>
            </ul>
            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={!!loadingPlan || !charityId}
              className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-colors disabled:opacity-40"
            >
              {loadingPlan === "monthly" ? "Redirecting…" : "Start Now"}
            </button>
          </div>

          {/* Yearly */}
          <div className="p-10 bg-slate-900/50 border-2 border-cyan-500/30 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] px-4 py-1 rounded-bl-xl uppercase font-black">
              Best Value
            </div>
            <h3 className="text-2xl font-bold">Yearly Impact</h3>
            <p className="text-5xl font-black my-6 text-white">
              $180<span className="text-lg text-slate-500">/yr</span>
            </p>
            <ul className="space-y-2 text-slate-400 text-sm mb-8">
              <li>✓ Everything in Monthly</li>
              <li>✓ Save $48 per year</li>
              <li>✓ Priority draw entry</li>
              <li>✓ Annual impact summary</li>
            </ul>
            <button
              onClick={() => handleSubscribe("yearly")}
              disabled={!!loadingPlan || !charityId}
              className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-colors disabled:opacity-40"
            >
              {loadingPlan === "yearly" ? "Redirecting…" : "Save $48/Year"}
            </button>
          </div>
        </div>

        {!charityId && (
          <p className="text-center text-amber-400 text-sm font-bold mt-6">
            ↑ Select a charity above to unlock plan selection.
          </p>
        )}
      </div>
    </div>
  );
};

export default Pricing;

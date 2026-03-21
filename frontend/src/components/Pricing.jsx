import React from "react";
import { supabase } from "../supabaseClient";

const Pricing = () => {
  const handleSubscribe = async (planType) => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        alert("Please login first!");
        return (window.location.href = "/login");
      }

      const response = await fetch(
        "https://golf-u6ol.onrender.com/api/payments/create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planType: planType, // 'monthly' or 'yearly'
            userId: session.user.id,
            email: session.user.email,
          }),
        },
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Backend Error Response:", data);
        alert(`Stripe Error: ${data.error || "Check backend terminal"}`);
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert(
        "Backend Server is Offline! Run 'npm start' in your backend folder.",
      );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white pt-32 pb-20 px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-black text-center mb-12 italic tracking-tighter">
          SELECT YOUR <span className="text-cyan-400">IMPACT</span>
        </h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="p-10 bg-slate-900/50 border border-slate-800 rounded-[2.5rem] hover:border-cyan-400 transition-all group">
            <h3 className="text-2xl font-bold">Monthly Impact</h3>
            <p className="text-5xl font-black my-6 text-cyan-400">
              $19<span className="text-lg text-slate-500">/mo</span>
            </p>
            <button
              onClick={() => handleSubscribe("monthly")}
              className="w-full py-4 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-colors"
            >
              Start Now
            </button>
          </div>

          <div className="p-10 bg-slate-900/50 border-2 border-cyan-500/30 rounded-[2.5rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-cyan-500 text-black text-[10px] px-4 py-1 rounded-bl-xl uppercase font-black">
              Best Value
            </div>
            <h3 className="text-2xl font-bold">Yearly Impact</h3>
            <p className="text-5xl font-black my-6 text-white">
              $180<span className="text-lg text-slate-500">/yr</span>
            </p>
            <button
              onClick={() => handleSubscribe("yearly")}
              className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-cyan-400 transition-colors"
            >
              Save $48/Year
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // CHANGE THIS TO YOUR ACTUAL ADMIN EMAIL
  const ADMIN_EMAIL = "your-email@example.com";

  useEffect(() => {
    // Check initial session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    // Listen for auth changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      },
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-8 h-20 flex justify-between items-center">
        {/* Logo Section */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tighter italic text-white group"
        >
          DIGITAL
          <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
            HEROES
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8 font-medium text-sm">
          <Link
            to="/"
            className="text-slate-400 hover:text-cyan-400 transition-all duration-300"
          >
            Concept
          </Link>

          <Link
            to="/dashboard"
            className="text-slate-400 hover:text-cyan-400 transition-all duration-300"
          >
            My Impact
          </Link>

          {/* DYNAMIC ADMIN LINK: Only shows if YOU are logged in */}
          {user?.email === ADMIN_EMAIL && (
            <Link
              to="/admin"
              className="text-cyan-500 hover:text-cyan-300 transition-colors text-xs uppercase tracking-widest border border-cyan-500/20 px-3 py-1 rounded"
            >
              Admin_Portal
            </Link>
          )}

          {/* DYNAMIC AUTH BUTTON */}
          {user ? (
            <button
              onClick={handleLogout}
              className="bg-white/5 text-white border border-white/10 px-7 py-2.5 rounded-full font-bold hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 transition-all"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-black px-7 py-2.5 rounded-full font-bold hover:bg-cyan-400 hover:scale-105 transition-all shadow-lg shadow-cyan-500/10"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

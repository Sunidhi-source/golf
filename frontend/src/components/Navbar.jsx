import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Read admin email from env — never hardcode credentials in source files
  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-black tracking-tighter italic text-white group"
        >
          DIGITAL
          <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
            HEROES
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link
            to="/"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            to="/pricing"
            className="text-slate-400 hover:text-white transition-colors"
          >
            Pricing
          </Link>

          {user && (
            <Link
              to="/dashboard"
              className="text-slate-400 hover:text-white transition-colors"
            >
              My Dashboard
            </Link>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              className="text-cyan-400 hover:text-cyan-300 transition-colors text-xs uppercase tracking-widest border border-cyan-500/30 px-3 py-1.5 rounded-lg"
            >
              Admin Portal
            </Link>
          )}

          {user ? (
            <button
              onClick={handleLogout}
              className="bg-white/5 text-white border border-white/10 px-6 py-2.5 rounded-full font-bold hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-all text-sm"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-black px-6 py-2.5 rounded-full font-bold hover:bg-cyan-400 hover:scale-105 transition-all shadow-lg"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden text-slate-400 hover:text-white transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#020617] border-t border-white/5 px-6 py-4 flex flex-col gap-4 text-sm font-medium">
          <Link
            to="/"
            onClick={() => setMenuOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            Home
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMenuOpen(false)}
            className="text-slate-400 hover:text-white"
          >
            Pricing
          </Link>
          {user && (
            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              My Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="text-cyan-400 text-xs uppercase tracking-widest"
            >
              Admin Portal
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="text-left text-red-400 font-bold"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="text-white font-bold"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

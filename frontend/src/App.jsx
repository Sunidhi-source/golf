import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./supabaseClient";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminPanel from "./pages/AdminPanel";
import Pricing from "./components/Pricing";

const AdminRoute = ({ user, loading, children }) => {
  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
  if (loading) return <div className="min-h-screen bg-[#020617]" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />;
  return children;
};

const ProtectedRoute = ({ user, loading, children }) => {
  if (loading) return <div className="min-h-screen bg-[#020617]" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null),
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-cyan-500/30">
        <Navbar user={user} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pricing" element={<Pricing />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute user={user} loading={loading}>
                <AdminPanel />
              </AdminRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

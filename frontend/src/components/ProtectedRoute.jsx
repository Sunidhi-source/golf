import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const ProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;

      if (session?.user?.email === adminEmail) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, []);

  if (isAdmin === null) return <div className="bg-[#020617] h-screen"></div>;
  return isAdmin ? children : <Navigate to="/" />;
};

export default ProtectedRoute;

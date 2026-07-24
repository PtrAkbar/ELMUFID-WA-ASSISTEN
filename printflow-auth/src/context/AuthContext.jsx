import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SessionLoading from "../atoms/SessionLoading";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    async function initSesi() {
      const params = new URLSearchParams(window.location.search);
      if (params.get("logout") === "1") {
        await supabase.auth.signOut();
        window.history.replaceState(null, "", window.location.pathname);
      }

      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setMemuat(false);
    }

    initSesi();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sesiBaru) => {
      setSession(sesiBaru);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function keluar() {
    await supabase.auth.signOut();
  }

  if (memuat) return <SessionLoading />;

  return (
    <AuthContext.Provider value={{ session, admin: session?.user ?? null, keluar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

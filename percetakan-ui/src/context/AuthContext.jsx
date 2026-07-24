import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SessionLoader from "../components/SessionLoader";

const LOGIN_URL = import.meta.env.VITE_LOGIN_URL || "http://localhost:5174/login";

function keLogin() {
  const tujuan = new URL(LOGIN_URL);
  tujuan.searchParams.set("logout", "1");
  window.location.href = tujuan.toString();
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let initialDone = false;

    async function ambilSesiDariHandoff() {
      const hash = window.location.hash;
      if (!hash.includes("access_token")) return;

      const params = new URLSearchParams(hash.slice(1));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
      window.history.replaceState(null, "", window.location.pathname);
    }

    async function initSesi() {
      await ambilSesiDariHandoff();

      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setMemuat(false);
      initialDone = true;

      if (!data.session) {
        keLogin();
      }
    }

    initSesi();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sesiBaru) => {
      setSession(sesiBaru);
      if (initialDone && !sesiBaru) {
        keLogin();
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    keLogin();
  }

  if (memuat || !session) return <SessionLoader />;

  return (
    <AuthContext.Provider value={{ session, user: session.user, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

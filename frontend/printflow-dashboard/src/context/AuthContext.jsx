import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SessionLoader from "../atoms/SessionLoader";

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
    let aktif = true;

    async function ambilSesiDariHandoff() {
      try {
        const hash = window.location.hash;
        if (!hash.includes("access_token")) return;

        const params = new URLSearchParams(hash.slice(1));
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ access_token, refresh_token });
        }
        window.history.replaceState(null, "", window.location.pathname);
      } catch (e) {
        console.warn("Gagal set session dari handoff:", e);
      }
    }

    async function initSesi() {
      try {
        await ambilSesiDariHandoff();

        const getSessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve({ data: { session: null }, error: new Error("Session timeout") }), 3000)
        );

        const { data } = await Promise.race([getSessionPromise, timeoutPromise]);
        if (aktif) {
          setSession(data?.session ?? null);
          initialDone = true;

          if (!data?.session) {
            keLogin();
          }
        }
      } catch (err) {
        console.error("Gagal memeriksa sesi dashboard:", err);
        if (aktif) {
          setSession(null);
          initialDone = true;
          keLogin();
        }
      } finally {
        if (aktif) {
          setMemuat(false);
        }
      }
    }

    initSesi();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sesiBaru) => {
      if (aktif) {
        setSession(sesiBaru);
        if (initialDone && !sesiBaru) {
          keLogin();
        }
      }
    });

    return () => {
      aktif = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function logout() {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (e) {
      console.warn("Logout error:", e);
    }
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

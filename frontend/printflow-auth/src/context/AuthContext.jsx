import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import SessionLoading from "../atoms/SessionLoading";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [memuat, setMemuat] = useState(true);

  useEffect(() => {
    let aktif = true;

    async function initSesi() {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("logout") === "1") {
          try {
            await Promise.race([
              supabase.auth.signOut({ scope: "local" }),
              new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 2000)),
            ]);
          } catch (e) {
            console.warn("Logout error/timeout:", e);
          }
          window.history.replaceState(null, "", window.location.pathname);
        }

        // Gunakan timeout agar tidak menggantung tanpa batas jika Supabase unresolvable / down
        const getSessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((resolve) =>
          setTimeout(() => resolve({ data: { session: null }, error: new Error("Session check timeout") }), 3000)
        );

        const { data } = await Promise.race([getSessionPromise, timeoutPromise]);
        if (aktif) {
          setSession(data?.session ?? null);
        }
      } catch (err) {
        console.error("Gagal memeriksa sesi login:", err);
        if (aktif) {
          setSession(null);
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
      }
    });

    return () => {
      aktif = false;
      listener?.subscription?.unsubscribe?.();
    };
  }, []);

  async function keluar() {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (e) {
      console.warn("Gagal keluar:", e);
    }
    setSession(null);
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

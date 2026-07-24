import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

const initial = { status: "connecting-server", qr: null, number: null };

export function useWaStatus() {
  const { session } = useAuth();
  const [state, setState] = useState(initial);

  useEffect(() => {
    if (!session?.access_token) return;

    // EventSource bawaan browser tidak bisa kirim header Authorization, jadi
    // token dikirim lewat query string khusus buat endpoint ini.
    const source = new EventSource(
      `${API_BASE_URL}/api/wa/events?token=${encodeURIComponent(session.access_token)}`
    );

    source.onmessage = (event) => {
      setState(JSON.parse(event.data));
    };

    source.onerror = () => {
      setState((prev) => (prev.status === "offline" ? prev : { status: "offline", qr: null, number: null }));
    };

    return () => source.close();
  }, [session?.access_token]);

  async function logout() {
    await fetch(`${API_BASE_URL}/api/wa/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
  }

  return { ...state, logout };
}

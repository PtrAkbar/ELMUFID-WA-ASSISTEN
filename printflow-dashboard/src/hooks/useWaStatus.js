import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";

const initial = { status: "connecting-server", qr: null, number: null };

export function useWaStatus() {
  const [state, setState] = useState(initial);

  useEffect(() => {
    const source = new EventSource(`${API_BASE_URL}/api/wa/events`);

    source.onmessage = (event) => {
      setState(JSON.parse(event.data));
    };

    source.onerror = () => {
      setState((prev) => (prev.status === "offline" ? prev : { status: "offline", qr: null, number: null }));
    };

    return () => source.close();
  }, []);

  async function logout() {
    await fetch(`${API_BASE_URL}/api/wa/logout`, { method: "POST" });
  }

  return { ...state, logout };
}

import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Spinner from "../loading/Spinner";

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL || "http://localhost:5173";

export default function Dashboard() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;
    const tujuan = new URL(DASHBOARD_URL);
    tujuan.hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
    window.location.replace(tujuan.toString());
  }, [session]);

  return <Spinner label="Mengalihkan ke dashboard" />;
}

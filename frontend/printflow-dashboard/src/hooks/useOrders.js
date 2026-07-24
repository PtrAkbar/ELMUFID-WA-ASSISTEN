import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { mapOrderRow } from "../lib/orders";

export function useOrders() {
  const { session } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBaruMasuk, setOrderBaruMasuk] = useState(null);

  function authHeaders(extra) {
    return { Authorization: `Bearer ${session?.access_token}`, ...extra };
  }

  useEffect(() => {
    if (!session?.access_token) return;

    async function ambilOrders() {
      const res = await fetch(`${API_BASE_URL}/api/orders`, { headers: authHeaders() });
      const data = await res.json().catch(() => null);
      if (Array.isArray(data)) setOrders(data.map(mapOrderRow));
      setLoading(false);
    }

    ambilOrders();

    // EventSource bawaan browser tidak bisa kirim header Authorization, jadi
    // token dikirim lewat query string khusus buat endpoint ini.
    const source = new EventSource(
      `${API_BASE_URL}/api/orders/events?token=${encodeURIComponent(session.access_token)}`
    );

    source.onmessage = (event) => {
      const { type, row } = JSON.parse(event.data);
      if (!row) return;
      const order = mapOrderRow(row);

      if (type === "INSERT") {
        setOrders((prev) => [order, ...prev]);
        setOrderBaruMasuk(order);
      } else if (type === "UPDATE") {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      } else if (type === "DELETE") {
        setOrders((prev) => prev.filter((o) => o.id !== order.id));
      }
    };

    return () => source.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  async function tambahOrder({ nama, nomor, detail, total }) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ nama, nomor, detail, total }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        return { error: { message: data?.error || "Gagal menyimpan order" } };
      }
      return { error: null };
    } catch (err) {
      return { error: { message: "Server bot tidak terjangkau, cek apakah backend sedang jalan" } };
    }
  }

  async function ubahStatus(id, status) {
    const sebelum = orders;
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/${id}/status`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("gagal");
    } catch {
      setOrders(sebelum);
    }
  }

  async function hapusSemuaOrderAktif() {
    const sebelum = orders;
    setOrders((prev) => prev.filter((o) => o.status === "selesai"));
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/aktif`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("gagal");
      return { error: null };
    } catch {
      setOrders(sebelum);
      return { error: { message: "Gagal menghapus semua order" } };
    }
  }

  async function hapusSemuaRiwayat() {
    const sebelum = orders;
    setOrders((prev) => prev.filter((o) => o.status !== "selesai"));
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders/riwayat`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("gagal");
      return { error: null };
    } catch {
      setOrders(sebelum);
      return { error: { message: "Gagal menghapus riwayat" } };
    }
  }

  return { orders, loading, orderBaruMasuk, tambahOrder, ubahStatus, hapusSemuaOrderAktif, hapusSemuaRiwayat };
}

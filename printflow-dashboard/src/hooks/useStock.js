import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

export function useStock() {
  const { session } = useAuth();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function authHeaders(extra) {
    return { Authorization: `Bearer ${session?.access_token}`, ...extra };
  }

  useEffect(() => {
    ambilStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  async function ambilStock() {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/stock`, { headers: authHeaders() });
    const data = await res.json();
    setStockItems(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function tambahBarang(nama, harga) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ nama, harga }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        return { error: { message: data?.error || "Gagal menyimpan barang ke Sheet" } };
      }
      await ambilStock();
      return { error: null };
    } catch (err) {
      return { error: { message: "Server bot tidak terjangkau, cek apakah backend sedang jalan" } };
    }
  }

  async function ubahStockStatus(kode, status) {
    const sebelum = stockItems;
    setStockItems((prev) => prev.map((s) => (s.kode === kode ? { ...s, status } : s)));
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock/${kode}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("gagal");
      return { error: null };
    } catch {
      setStockItems(sebelum);
      return { error: { message: "Gagal mengubah status di Sheet" } };
    }
  }

  async function ubahHarga(kode, harga) {
    const sebelum = stockItems;
    setStockItems((prev) => prev.map((s) => (s.kode === kode ? { ...s, harga } : s)));
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock/${kode}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ harga }),
      });
      if (!res.ok) throw new Error("gagal");
      return { error: null };
    } catch {
      setStockItems(sebelum);
      return { error: { message: "Gagal mengubah harga di Sheet" } };
    }
  }

  async function hapusBarang(kode) {
    const sebelum = stockItems;
    setStockItems((prev) => prev.filter((s) => s.kode !== kode));
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock/${kode}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("gagal");
      return { error: null };
    } catch {
      setStockItems(sebelum);
      return { error: { message: "Gagal menghapus barang di Sheet" } };
    }
  }

  async function hapusSemuaBarang() {
    const sebelum = stockItems;
    setStockItems([]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("gagal");
      return { error: null };
    } catch {
      setStockItems(sebelum);
      return { error: { message: "Gagal menghapus semua barang di Sheet" } };
    }
  }

  async function importBarang(daftar) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stock/bulk`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ barang: daftar }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        return { error: { message: data?.error || "Gagal mengimpor barang ke Sheet" }, jumlah: 0 };
      }
      await ambilStock();
      return { error: null, jumlah: data.jumlah };
    } catch (err) {
      return { error: { message: "Server bot tidak terjangkau, cek apakah backend sedang jalan" }, jumlah: 0 };
    }
  }

  return { stockItems, loading, tambahBarang, ubahStockStatus, ubahHarga, hapusBarang, hapusSemuaBarang, importBarang };
}

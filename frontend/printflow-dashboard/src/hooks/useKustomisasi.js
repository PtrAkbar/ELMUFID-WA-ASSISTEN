import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";

export function useKustomisasi() {
  const { session } = useAuth();
  const [qris, setQris] = useState(null);
  const [rekeningList, setRekeningList] = useState([]);
  const [loading, setLoading] = useState(true);

  function authHeaders(extra) {
    return { Authorization: `Bearer ${session?.access_token}`, ...extra };
  }

  useEffect(() => {
    if (!session?.access_token) return;
    ambilSemua();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  async function ambilSemua() {
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/kustomisasi`, { headers: authHeaders() });
    const data = await res.json().catch(() => null);
    setQris(data?.qris || null);
    setRekeningList(data?.rekeningList || []);
    setLoading(false);
  }

  async function uploadQris(file) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/kustomisasi/qris`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return { error: { message: data?.error || "Gagal upload QRIS" } };
      setQris(data.qris);
      return { error: null };
    } catch (err) {
      return { error: { message: "Server bot tidak terjangkau, cek apakah backend sedang jalan" } };
    }
  }

  async function hapusQris() {
    try {
      const res = await fetch(`${API_BASE_URL}/api/kustomisasi/qris`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) return { error: { message: "Gagal menghapus QRIS" } };
      setQris(null);
      return { error: null };
    } catch (err) {
      return { error: { message: "Server bot tidak terjangkau, cek apakah backend sedang jalan" } };
    }
  }

  async function tambahRekening({ namaBank, nomorRekening, atasNama }) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/kustomisasi/rekening`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ namaBank, nomorRekening, atasNama }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) return { error: { message: data?.error || "Gagal menambah rekening" } };
      setRekeningList((prev) => [data, ...prev]);
      return { error: null };
    } catch (err) {
      return { error: { message: "Server bot tidak terjangkau, cek apakah backend sedang jalan" } };
    }
  }

  async function hapusRekening(id) {
    const sebelum = rekeningList;
    setRekeningList((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`${API_BASE_URL}/api/kustomisasi/rekening/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("gagal");
      return { error: null };
    } catch {
      setRekeningList(sebelum);
      return { error: { message: "Gagal menghapus rekening" } };
    }
  }

  return { qris, rekeningList, loading, uploadQris, hapusQris, tambahRekening, hapusRekening };
}

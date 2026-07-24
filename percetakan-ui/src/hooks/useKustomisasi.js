import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function useKustomisasi() {
  const [qris, setQris] = useState(null);
  const [rekeningList, setRekeningList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ambilSemua();
  }, []);

  async function ambilSemua() {
    setLoading(true);
    const [qrisRes, rekeningRes] = await Promise.all([
      supabase.from("qris_config").select("gambar_url").eq("id", 1).maybeSingle(),
      supabase.from("rekening_config").select("*").order("created_at", { ascending: false }),
    ]);
    setQris(qrisRes.data?.gambar_url || null);
    setRekeningList(rekeningRes.data || []);
    setLoading(false);
  }

  async function uploadQris(file) {
    const namaFile = `qris-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: errUpload } = await supabase.storage.from("qris").upload(namaFile, file, { upsert: true });
    if (errUpload) return { error: errUpload };

    const { data: publicUrlData } = supabase.storage.from("qris").getPublicUrl(namaFile);
    const { error: errSimpan } = await supabase
      .from("qris_config")
      .upsert({ id: 1, gambar_url: publicUrlData.publicUrl, updated_at: new Date().toISOString() });
    if (errSimpan) return { error: errSimpan };

    setQris(publicUrlData.publicUrl);
    return { error: null };
  }

  async function hapusQris() {
    const { error } = await supabase.from("qris_config").upsert({ id: 1, gambar_url: null });
    if (error) return { error };
    setQris(null);
    return { error: null };
  }

  async function tambahRekening({ namaBank, nomorRekening, atasNama }) {
    const { data, error } = await supabase
      .from("rekening_config")
      .insert({ nama_bank: namaBank, nomor_rekening: nomorRekening, atas_nama: atasNama || null })
      .select()
      .single();
    if (error) return { error };
    setRekeningList((prev) => [data, ...prev]);
    return { error: null };
  }

  async function hapusRekening(id) {
    const sebelum = rekeningList;
    setRekeningList((prev) => prev.filter((r) => r.id !== id));
    const { error } = await supabase.from("rekening_config").delete().eq("id", id);
    if (error) {
      setRekeningList(sebelum);
      return { error };
    }
    return { error: null };
  }

  return { qris, rekeningList, loading, uploadQris, hapusQris, tambahRekening, hapusRekening };
}

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { mapOrderRow } from "../lib/orders";

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderBaruMasuk, setOrderBaruMasuk] = useState(null);

  useEffect(() => {
    async function ambilOrders() {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (!error) setOrders(data.map(mapOrderRow));
      setLoading(false);
    }

    ambilOrders();

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) => {
        const order = mapOrderRow(payload.new);
        setOrders((prev) => [order, ...prev]);
        setOrderBaruMasuk(order);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) => {
        const order = mapOrderRow(payload.new);
        setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "orders" }, (payload) => {
        setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function tambahOrder({ nama, nomor, detail, total }) {
    const { error } = await supabase.from("orders").insert({
      nama_customer: nama,
      nomor_wa: nomor,
      detail,
      total,
    });
    return { error };
  }

  async function ubahStatus(id, status) {
    await supabase.from("orders").update({ status }).eq("id", id);
  }

  async function hapusSemuaOrderAktif() {
    const sebelum = orders;
    setOrders((prev) => prev.filter((o) => o.status === "selesai"));
    const { error } = await supabase.from("orders").delete().neq("status", "selesai");
    if (error) {
      setOrders(sebelum);
      return { error };
    }
    return { error: null };
  }

  async function hapusSemuaRiwayat() {
    const sebelum = orders;
    setOrders((prev) => prev.filter((o) => o.status !== "selesai"));
    const { error } = await supabase.from("orders").delete().eq("status", "selesai");
    if (error) {
      setOrders(sebelum);
      return { error };
    }
    return { error: null };
  }

  return { orders, loading, orderBaruMasuk, tambahOrder, ubahStatus, hapusSemuaOrderAktif, hapusSemuaRiwayat };
}

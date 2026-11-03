"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

type Signal = {
  id: number;
  created_at: string;
  symbol: string;
  timeframe: string;
  direction: string;
  quality: string;
  entry: number;
  sl: number;
  tp: number;
  pivot_time: string;
};

export default function HistoryPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSignals() {
      const { data, error } = await supabase
        .from("signals")
        .select("*")
        .order("id", { ascending: false })
        .limit(20);

      if (data) setSignals(data);
      setIsLoading(false);
    }

    fetchSignals();
  }, []);

  // Fungsi Logika Status TP/SL
  const getStatus = (s: Signal) => {
    // Sementara kita pakai Entry terbaru dari database sebagai "harga live" tiruan
    // Nanti kita akan sambungkan ke API harga sungguhan
    const hargaSekarang = signals[0]?.entry || s.entry;

    if (s.direction === "BUY") {
      if (hargaSekarang >= s.tp) return { text: "WIN", color: "bg-green-100 text-green-700" };
      if (hargaSekarang <= s.sl) return { text: "LOSS", color: "bg-red-100 text-red-700" };
    } else {
      if (hargaSekarang <= s.tp) return { text: "WIN", color: "bg-green-100 text-green-700" };
      if (hargaSekarang >= s.sl) return { text: "LOSS", color: "bg-red-100 text-red-700" };
    }
    return { text: "PENDING", color: "bg-gray-100 text-gray-600" };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">😎</span>
            <h1 className="text-xl font-bold text-slate-800">
              Haha<span className="text-amber-500">Trade</span>
            </h1>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="hover:text-amber-500 transition">Dashboard</Link>
            <Link href="/history" className="text-amber-500">Riwayat</Link>
            <a href="#" className="hover:text-amber-500 transition">Panduan</a>
          </nav>
        </div>
      </header>

      {/* KONTEN RIWAYAT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Riwayat Sinyal</h2>
          <p className="text-gray-500 text-sm mt-1">20 sinyal terakhir dari database.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Memuat data...</div>
          ) : signals.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Belum ada riwayat sinyal.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Waktu (WIB)</th>
                    <th className="px-6 py-4">TF</th>
                    <th className="px-6 py-4">Arah</th>
                    <th className="px-6 py-4">Kualitas</th>
                    <th className="px-6 py-4">Entry</th>
                    <th className="px-6 py-4">SL</th>
                    <th className="px-6 py-4">TP</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {signals.map((s) => {
                    const status = getStatus(s);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                          {/* Format Tanggal & Jam */}
                          {new Date(s.pivot_time).toLocaleString("id-ID", {
                            timeZone: "Asia/Jakarta",
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          }).replace(/\./g, ":")}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">{s.timeframe}</td>
                        <td className={`px-6 py-4 font-bold ${s.direction === "BUY" ? "text-green-600" : "text-red-600"}`}>
                          {s.direction}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                            s.quality === "Kuat" ? "bg-green-100 text-green-700" :
                            s.quality === "Sedang" ? "bg-amber-100 text-amber-700" :
                            "bg-red-100 text-red-700"
                          }`}>
                            {s.quality}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">{s.entry.toFixed(2)}</td>
                        <td className="px-6 py-4 font-mono text-red-500">{s.sl.toFixed(2)}</td>
                        <td className="px-6 py-4 font-mono text-green-600">{s.tp.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${status.color}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
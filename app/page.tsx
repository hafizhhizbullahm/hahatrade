"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TVChart from "./components/TVChart";
import { supabase } from "./lib/supabase";

type Signal = {
  id: number;
  timeframe: string;
  direction: string;
  quality: string;
  entry: number;
  sl: number;
  tp: number;
  pivot_time: string;
};

export default function Home() {
  const [latestSignal, setLatestSignal] = useState<Signal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Statistik
  const [stats, setStats] = useState({ total: 0, win: 0, loss: 0, winrate: 0 });

  useEffect(() => {
    async function fetchData() {
      // 1. Ambil sinyal terbaru
      const { data: latest } = await supabase
        .from("signals")
        .select("*")
        .order("id", { ascending: false })
        .limit(1)
        .single();

      if (latest) setLatestSignal(latest);

      // 2. Ambil semua sinyal untuk menghitung statistik
      const { data: allSignals } = await supabase
        .from("signals")
        .select("*")
        .order("id", { ascending: false });

      if (allSignals && allSignals.length > 0) {
        let win = 0;
        let loss = 0;
        // Logika sederhana: jika harga terbaru sudah lewat TP -> Win, lewat SL -> Loss
        // (Karena belum ada API harga live, kita pakai harga entry terbaru)
        const currentPrice = allSignals[0].entry; 

        allSignals.forEach((s) => {
          if (s.direction === "BUY") {
            if (currentPrice >= s.tp) win++;
            else if (currentPrice <= s.sl) loss++;
          } else {
            if (currentPrice <= s.tp) win++;
            else if (currentPrice >= s.sl) loss++;
          }
        });

        const total = allSignals.length;
        const winrate = total > 0 ? Math.round((win / (win + loss)) * 100) : 0;
        
        setStats({ total, win, loss, winrate: isNaN(winrate) ? 0 : winrate });
      }

      setIsLoading(false);
    }

    fetchData();
    // Refresh data setiap 10 detik
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getQualityColor = (quality: string) => {
    if (quality === "Kuat") return "bg-green-50 border-green-200 text-green-800";
    if (quality === "Sedang") return "bg-amber-50 border-amber-200 text-amber-800";
    return "bg-red-50 border-red-200 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">😎</span>
            <h1 className="text-xl font-bold text-slate-800">
              Haha<span className="text-amber-500">Trade</span>
            </h1>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/" className="text-amber-500">Dashboard</Link>
            <Link href="/history" className="hover:text-amber-500 transition">Riwayat</Link>
            <a href="#" className="hover:text-amber-500 transition">Panduan</a>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live
            </div>
            <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition">
              👤
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Sinyal</h2>
          <p className="text-gray-500 text-sm mt-1">Pantau pergerakan XAU/USD secara real-time.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KOLOM KIRI (SINYAL & STATISTIK) */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* CARD SINYAL DINAMIS */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-lg">XAU/USD</h3>
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                  {latestSignal ? latestSignal.timeframe : "M15"}
                </span>
              </div>
              
              {isLoading ? (
                <div className="text-center py-10 text-gray-500">Memuat data...</div>
              ) : latestSignal ? (
                <>
                  <div className="text-center mb-6">
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Harga Entry (Kunci)</p>
                    <p className="text-4xl font-extrabold text-slate-900">{latestSignal.entry.toFixed(2)}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(latestSignal.pivot_time).toLocaleString("id-ID", {
                        timeZone: "Asia/Jakarta", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                      }).replace(/\./g, ":")}
                    </p>
                  </div>

                  <div className={`border rounded-xl p-4 mb-4 ${getQualityColor(latestSignal.quality)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">⚡</span>
                      <h4 className="font-bold text-sm">SINYAL {latestSignal.quality.toUpperCase()}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Arah</p>
                        <p className={`font-bold ${latestSignal.direction === "BUY" ? "text-green-600" : "text-red-600"}`}>
                          {latestSignal.direction}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Entry</p>
                        <p className="font-bold text-slate-800">{latestSignal.entry.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">SL</p>
                        <p className="font-bold text-red-500">{latestSignal.sl.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">TP</p>
                        <p className="font-bold text-green-600">{latestSignal.tp.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-gray-500">Belum ada sinyal dari bot.</div>
              )}
              
              <a 
                href="https://t.me/AIRifan_signal_bot" // Ganti dengan username bot Bang
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 rounded-xl transition"
              >
                Buka Bot Telegram 🚀
              </a>
            </div>

            {/* CARD STATISTIK (SUDAH DINAMIS) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-slate-800 mb-4">Statistik Keseluruhan</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Sinyal</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Winrate</span>
                  <span className="font-bold text-green-600">{stats.winrate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Win / Loss</span>
                  <span className="font-bold">
                    <span className="text-green-600">{stats.win}W</span> / <span className="text-red-500">{stats.loss}L</span>
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* KOLOM KANAN (GRAFIK) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 h-full min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Grafik Harga</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-xs font-semibold bg-gray-100 rounded-md">1m</button>
                  <button className="px-3 py-1 text-xs font-semibold bg-amber-500 text-white rounded-md">15m</button>
                  <button className="px-3 py-1 text-xs font-semibold bg-gray-100 rounded-md">1h</button>
                </div>
              </div>
              
              <div className="flex-1 bg-white rounded-xl border border-gray-200 relative overflow-hidden">
                <TVChart />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
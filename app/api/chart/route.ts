import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Mengambil data XAU/USD (GC=F adalah kode Gold Futures di Yahoo)
    // Interval 15 menit, rentang 1 hari
    const url = "https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=15m&range=1d";
    
    // Gunakan fetch dengan User-Agent agar tidak diblokir Yahoo
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data dari Yahoo Finance");
    }

    const data = await response.json();
    
    // Ekstrak data candle
    const result = data.chart.result[0];
    const timestamps = result.timestamp;
    const quotes = result.indicators.quote[0];

    // Format data untuk Lightweight Charts
    const formattedData = timestamps.map((time: number, index: number) => ({
      time: time,
      open: quotes.open[index],
      high: quotes.high[index],
      low: quotes.low[index],
      close: quotes.close[index],
    })).filter((d: any) => d.open !== null); // Hapus data kosong

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
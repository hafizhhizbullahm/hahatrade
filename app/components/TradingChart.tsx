"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, CandlestickSeries, LineStyle } from "lightweight-charts";

// Tambahkan props agar bisa menerima data sinyal
interface TradingChartProps {
  entry?: number;
  sl?: number;
  tp?: number;
}

export default function TradingChart({ entry, sl, tp }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#64748b",
      },
      grid: {
        vertLines: { color: "#f1f5f9" },
        horzLines: { color: "#f1f5f9" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: { borderColor: "#e2e8f0", timeVisible: true },
      rightPriceScale: { borderColor: "#e2e8f0" },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    async function fetchChartData() {
      try {
        const res = await fetch("/api/chart");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          candleSeries.setData(data);
          chart.timeScale().fitContent(); 

          // GAMBAR GARIS ENTRY, SL, TP JIKA DATA TERSEDIA
          if (entry) {
            candleSeries.createPriceLine({ price: entry, color: '#f59e0b', lineWidth: 2, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'Entry' });
          }
          if (sl) {
            candleSeries.createPriceLine({ price: sl, color: '#ef5350', lineWidth: 2, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'SL' });
          }
          if (tp) {
            candleSeries.createPriceLine({ price: tp, color: '#26a69a', lineWidth: 2, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: 'TP' });
          }
        }
      } catch (error) {
        console.error("Gagal load grafik:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChartData();

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [entry, sl, tp]); // Re-render jika data entry/sl/tp berubah

  return (
    <div className="relative w-full h-[500px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 text-gray-500 font-semibold">
          Memuat Grafik...
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
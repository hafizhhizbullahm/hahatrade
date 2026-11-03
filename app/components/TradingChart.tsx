"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, CandlestickSeries } from "lightweight-charts";

export default function TradingChart() {
  const chartContainerRef = useRef<HTMLDivElement>(null);

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
      timeScale: {
        borderColor: "#e2e8f0",
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: "#e2e8f0",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    const data = [];
    let basePrice = 3900;
    let time = Math.floor(Date.now() / 1000) - 50 * 15 * 60; 
    
    for (let i = 0; i < 50; i++) {
      const open = basePrice + (Math.random() - 0.5) * 10;
      const close = open + (Math.random() - 0.5) * 15;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      data.push({ 
        time: (time + i * 15 * 60) as any, 
        open, high, low, close 
      });
      basePrice = close;
    }
    candleSeries.setData(data);

    candleSeries.createPriceLine({ price: 3905.38, color: '#f59e0b', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'Entry' });
    candleSeries.createPriceLine({ price: 3899.95, color: '#ef5350', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'SL' });
    candleSeries.createPriceLine({ price: 3910.81, color: '#26a69a', lineWidth: 2, lineStyle: 2, axisLabelVisible: true, title: 'TP' });

    candleSeries.createPriceLine({
      price: data[data.length - 1].close,
      color: "#2962ff",
      lineWidth: 1,
      lineStyle: 0,
      axisLabelVisible: true,
      title: "Live",
    });

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  return (
    <div className="relative w-full h-[500px]">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
"use client";

import { useEffect, useRef } from "react";

export default function TVChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Hapus script lama jika ada
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: "OANDA:XAUUSD",
      interval: "15",
      timezone: "Asia/Jakarta",
      theme: "light",
      style: "1",
      locale: "id",
      enable_publishing: false,
      hide_side_toolbar: true,
      allow_symbol_change: false,
      calendar: false,
      support_host: "https://www.tradingview.com",
      container_id: "tradingview_chart_container"
    });

    const widgetDiv = document.createElement("div");
    widgetDiv.id = "tradingview_chart_container";
    widgetDiv.className = "tradingview-widget-container";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    
    const widgetInner = document.createElement("div");
    widgetInner.className = "tradingview-widget-container__widget";
    widgetInner.style.height = "100%";
    widgetInner.style.width = "100%";

    widgetDiv.appendChild(widgetInner);
    widgetDiv.appendChild(script);
    containerRef.current.appendChild(widgetDiv);

  }, []);

  return (
    <div className="w-full h-[500px]" ref={containerRef}>
      {/* Widget akan di-render di sini */}
    </div>
  );
}
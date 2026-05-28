import React from "react";

export default function TrendAnalytics({ analytics, form }) {
  const cards = [
    {
      title: "eGFR Change",
      value: analytics.egfrChange.toFixed(2),
      subtitle: `${analytics.egfrPctChange.toFixed(2)}% over follow-up`
    },
    {
      title: "eGFR Slope / Month",
      value: analytics.egfrSlope.toFixed(2),
      subtitle: "Kidney function decline trend"
    },
    {
      title: "UACR Change",
      value: analytics.uacrChange.toFixed(2),
      subtitle: `${analytics.uacrPctChange.toFixed(2)}% albuminuria shift`
    },
    {
      title: "Latest BP",
      value: `${form.bpSys}/${form.bpDia}`,
      subtitle: "Blood pressure status"
    }
  ];

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "28px",
        padding: "24px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
      }}
    >
      <h2 style={{ marginTop: 0 }}>Clinical Trend Analytics</h2>

      <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              padding: "16px",
              borderRadius: "18px",
              background: "rgba(2,6,23,0.45)",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>{card.title}</div>
            <div style={{ fontSize: "26px", fontWeight: "bold", marginTop: "6px" }}>
              {card.value}
            </div>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
              {card.subtitle}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
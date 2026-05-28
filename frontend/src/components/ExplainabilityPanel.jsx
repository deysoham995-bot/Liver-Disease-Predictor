import React from "react";

export default function ExplainabilityPanel({ reasons }) {
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
      <h2 style={{ marginTop: 0 }}>Explainable Factors</h2>

      <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
        {reasons.length === 0 ? (
          <div
            style={{
              padding: "14px",
              borderRadius: "16px",
              background: "rgba(2,6,23,0.45)",
              color: "#94a3b8"
            }}
          >
            No major explainable factors detected from the current values.
          </div>
        ) : (
          reasons.map((reason, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                padding: "14px",
                borderRadius: "16px",
                background: "rgba(2,6,23,0.45)",
                border: "1px solid rgba(255,255,255,0.08)"
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#22d3ee",
                  marginTop: "6px"
                }}
              />
              <div>
                <div style={{ fontWeight: "bold" }}>{reason}</div>
                <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>
                  This factor may contribute to the predicted progression outcome.
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
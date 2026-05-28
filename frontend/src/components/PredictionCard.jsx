import React from "react";

export default function PredictionCard({ result, loading, apiError }) {
  const probs = result?.probabilities || {};

  const stable = probs.stable ? Math.round(probs.stable * 100) : 0;
  const slow = probs.slow_progression ? Math.round(probs.slow_progression * 100) : 0;
  const rapid = probs.rapid_progression ? Math.round(probs.rapid_progression * 100) : 0;

  const label = result?.prediction || "Awaiting prediction";

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
      <h2 style={{ marginTop: 0 }}>Prediction Summary</h2>

      {loading && <p style={{ color: "#cbd5e1" }}>Model is generating prediction...</p>}

      {apiError && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px",
            borderRadius: "14px",
            background: "rgba(239,68,68,0.15)",
            color: "#fecaca"
          }}
        >
          {apiError}
        </div>
      )}

      {!loading && !apiError && (
        <>
          <div
            style={{
              marginTop: "18px",
              padding: "20px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(59,130,246,0.15))",
              border: "1px solid rgba(255,255,255,0.08)"
            }}
          >
            <div style={{ fontSize: "13px", color: "#94a3b8" }}>Predicted Progression</div>
            <div style={{ fontSize: "30px", fontWeight: "bold", marginTop: "8px" }}>
              {label}
            </div>
          </div>

          <div style={{ marginTop: "20px", display: "grid", gap: "14px" }}>
            <Progress label="Stable" value={stable} />
            <Progress label="Slow Progression" value={slow} />
            <Progress label="Rapid Progression" value={rapid} />
          </div>
        </>
      )}
    </div>
  );
}

function Progress({ label, value }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "6px",
          color: "#cbd5e1",
          fontSize: "14px"
        }}
      >
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div
        style={{
          width: "100%",
          height: "12px",
          borderRadius: "999px",
          background: "rgba(255,255,255,0.08)",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            background: "linear-gradient(90deg, #22d3ee, #3b82f6)"
          }}
        />
      </div>
    </div>
  );
}
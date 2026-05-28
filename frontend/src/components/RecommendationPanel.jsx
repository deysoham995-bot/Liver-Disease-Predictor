import React from "react";

export default function RecommendationPanel({ result }) {
  let message =
    "Generate a prediction to view the educational recommendation panel.";

  if (result?.prediction === "stable") {
    message =
      "Prototype output: kidney function appears relatively stable. Continue routine monitoring and periodic review of eGFR, UACR, and blood pressure trends.";
  } else if (result?.prediction === "slow_progression") {
    message =
      "Prototype output: possible slow CKD progression. Closer follow-up and repeat clinical review may be needed for kidney markers and blood pressure control.";
  } else if (result?.prediction === "rapid_progression") {
    message =
      "Prototype output: higher-risk progression pattern detected. This case should be flagged for urgent specialist clinical review in a real-world setting.";
  }

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px"
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 0 }}>Recommendation Panel</h2>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            background: "rgba(250,204,21,0.12)",
            color: "#fde68a",
            fontSize: "12px",
            fontWeight: "bold"
          }}
        >
          NOT MEDICAL ADVICE
        </div>
      </div>

      <div
        style={{
          marginTop: "18px",
          padding: "18px",
          borderRadius: "18px",
          background: "rgba(2,6,23,0.45)",
          color: "#cbd5e1",
          lineHeight: 1.7
        }}
      >
        {message}
      </div>
    </div>
  );
}
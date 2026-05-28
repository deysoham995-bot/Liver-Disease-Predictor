import React from "react";

export default function Header({ form, analytics, result }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "28px",
        padding: "32px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 0.8fr",
          gap: "20px",
          alignItems: "center"
        }}
      >
        <div>
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(34,211,238,0.12)",
              color: "#67e8f9",
              fontSize: "12px",
              fontWeight: "bold",
              letterSpacing: "1px",
              marginBottom: "16px"
            }}
          >
            AI CLINICAL SUPPORT DASHBOARD
          </div>

          <h1 style={{ fontSize: "42px", margin: 0, lineHeight: 1.2 }}>
            Chronic Kidney Disease Progression Predictor
          </h1>

          <p
            style={{
              marginTop: "14px",
              color: "#cbd5e1",
              fontSize: "16px",
              lineHeight: 1.7,
              maxWidth: "850px"
            }}
          >
            Advanced healthcare AI prototype for predicting whether CKD is likely
            to remain stable, worsen slowly, or worsen rapidly using longitudinal
            patient markers and clinical history.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "14px"
          }}
        >
          <InfoCard title="Current CKD Stage" value={analytics.ckdStage} subtitle="Based on latest eGFR" />
          <InfoCard title="Follow-up Visits" value={String(form.visitCount)} subtitle={`${form.followupMonths} months tracked`} />
          <InfoCard
            title="Prediction Status"
            value={result ? "Ready" : "Pending"}
            subtitle={result ? "Backend result received" : "Awaiting prediction"}
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value, subtitle }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(2,6,23,0.5)",
        borderRadius: "22px",
        padding: "18px"
      }}
    >
      <div style={{ fontSize: "13px", color: "#94a3b8" }}>{title}</div>
      <div style={{ fontSize: "28px", fontWeight: "bold", marginTop: "6px" }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
        {subtitle}
      </div>
    </div>
  );
}
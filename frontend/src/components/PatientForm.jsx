import React from "react";

export default function PatientForm({
  form,
  handleChange,
  handlePredict,
  handleReset,
  loading
}) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "28px",
        padding: "28px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)"
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: "28px" }}>Patient Clinical Input</h2>
      <p style={{ color: "#94a3b8", marginBottom: "24px" }}>
        Enter patient clinical values and repeated kidney markers.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "16px"
        }}
      >
        <Field label="Patient Name / ID">
          <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
        </Field>

        <Field label="Age">
          <Input type="number" value={form.age} onChange={(e) => handleChange("age", Number(e.target.value))} />
        </Field>

        <Field label="Sex">
          <Select value={form.sex} onChange={(e) => handleChange("sex", e.target.value)} options={["Male", "Female"]} />
        </Field>

        <Field label="Weight (kg)">
          <Input type="number" value={form.weight} onChange={(e) => handleChange("weight", Number(e.target.value))} />
        </Field>

        <Field label="Diabetes">
          <Select value={form.diabetes} onChange={(e) => handleChange("diabetes", e.target.value)} options={["Yes", "No"]} />
        </Field>

        <Field label="Hypertension">
          <Select value={form.hypertension} onChange={(e) => handleChange("hypertension", e.target.value)} options={["Yes", "No"]} />
        </Field>

        <Field label="Smoking">
          <Select value={form.smoking} onChange={(e) => handleChange("smoking", e.target.value)} options={["Yes", "No"]} />
        </Field>

        <Field label="RAAS Blocker">
          <Select value={form.raasBlocker} onChange={(e) => handleChange("raasBlocker", e.target.value)} options={["Yes", "No"]} />
        </Field>

        <Field label="Visit Count">
          <Input type="number" value={form.visitCount} onChange={(e) => handleChange("visitCount", Number(e.target.value))} />
        </Field>

        <Field label="Follow-up Months">
          <Input type="number" value={form.followupMonths} onChange={(e) => handleChange("followupMonths", Number(e.target.value))} />
        </Field>

        <Field label="First eGFR">
          <Input type="number" value={form.egfrFirst} onChange={(e) => handleChange("egfrFirst", Number(e.target.value))} />
        </Field>

        <Field label="Latest eGFR">
          <Input type="number" value={form.egfrLast} onChange={(e) => handleChange("egfrLast", Number(e.target.value))} />
        </Field>

        <Field label="First UACR">
          <Input type="number" value={form.uacrFirst} onChange={(e) => handleChange("uacrFirst", Number(e.target.value))} />
        </Field>

        <Field label="Latest UACR">
          <Input type="number" value={form.uacrLast} onChange={(e) => handleChange("uacrLast", Number(e.target.value))} />
        </Field>

        <Field label="Systolic BP">
          <Input type="number" value={form.bpSys} onChange={(e) => handleChange("bpSys", Number(e.target.value))} />
        </Field>

        <Field label="Diastolic BP">
          <Input type="number" value={form.bpDia} onChange={(e) => handleChange("bpDia", Number(e.target.value))} />
        </Field>

        <Field label="Serum Creatinine">
          <Input type="number" step="0.01" value={form.creatinine} onChange={(e) => handleChange("creatinine", Number(e.target.value))} />
        </Field>

        <Field label="Hemoglobin">
          <Input type="number" step="0.1" value={form.hemoglobin} onChange={(e) => handleChange("hemoglobin", Number(e.target.value))} />
        </Field>

        <Field label="Sodium">
          <Input type="number" step="0.1" value={form.sodium} onChange={(e) => handleChange("sodium", Number(e.target.value))} />
        </Field>

        <Field label="Potassium">
          <Input type="number" step="0.1" value={form.potassium} onChange={(e) => handleChange("potassium", Number(e.target.value))} />
        </Field>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
        <button
          onClick={handlePredict}
          disabled={loading}
          style={primaryBtn}
        >
          {loading ? "Predicting..." : "Generate Prediction"}
        </button>

        <button
          onClick={handleReset}
          style={secondaryBtn}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ marginBottom: "8px", fontSize: "14px", color: "#cbd5e1" }}>{label}</div>
      {children}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(255,255,255,0.05)",
        color: "white",
        outline: "none",
        boxSizing: "border-box"
      }}
    />
  );
}

function Select({ options, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.10)",
        background: "#0f172a",
        color: "white",
        outline: "none",
        boxSizing: "border-box"
      }}
    >
      {options.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}

const primaryBtn = {
  padding: "12px 18px",
  borderRadius: "16px",
  border: "none",
  background: "#22d3ee",
  color: "#082f49",
  fontWeight: "bold",
  cursor: "pointer"
};

const secondaryBtn = {
  padding: "12px 18px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer"
};
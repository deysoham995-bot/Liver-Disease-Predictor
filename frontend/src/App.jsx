import React, { useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  Droplets,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  TrendingDown,
  UserRound,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const defaultForm = {
  name: "",
  age: 58,
  sex: "Male",
  weight: 72,
  diabetes: "Yes",
  hypertension: "Yes",
  smoking: "No",
  raasBlocker: "Yes",
  egfrFirst: 42,
  egfrLast: 35,
  uacrFirst: 320,
  uacrLast: 410,
  bpSys: 152,
  bpDia: 94,
  creatinine: 2.23,
  hemoglobin: 10.5,
  sodium: 138,
  potassium: 4.8,
  followupMonths: 8,
  visitCount: 3,
};

export default function App() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  const predictorRef = useRef(null);
  const analyticsRef = useRef(null);
  const insightsRef = useRef(null);
  const reviewRef = useRef(null);

  const sectionMap = {
    predictor: predictorRef,
    analytics: analyticsRef,
    insights: insightsRef,
    review: reviewRef,
  };

  const scrollToSection = (key) => {
    sectionMap[key]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setValidationErrors((prev) => ({
      ...prev,
      [key]: "",
    }));

    setApiError("");
  };

  const validateForm = () => {
    const errors = {};

    if (Number(form.age) < 1 || Number(form.age) > 120) errors.age = "Enter age between 1 and 120.";
    if (Number(form.weight) < 1 || Number(form.weight) > 300) errors.weight = "Enter weight between 1 and 300 kg.";
    if (Number(form.egfrFirst) < 1 || Number(form.egfrFirst) > 200) errors.egfrFirst = "Enter a valid first kidney function score.";
    if (Number(form.egfrLast) < 1 || Number(form.egfrLast) > 200) errors.egfrLast = "Enter a valid latest kidney function score.";
    if (Number(form.uacrFirst) < 0 || Number(form.uacrFirst) > 5000) errors.uacrFirst = "Enter a valid first urine protein value.";
    if (Number(form.uacrLast) < 0 || Number(form.uacrLast) > 5000) errors.uacrLast = "Enter a valid latest urine protein value.";
    if (Number(form.bpSys) < 50 || Number(form.bpSys) > 300) errors.bpSys = "Enter a valid top blood pressure number.";
    if (Number(form.bpDia) < 30 || Number(form.bpDia) > 200) errors.bpDia = "Enter a valid bottom blood pressure number.";
    if (Number(form.creatinine) < 0 || Number(form.creatinine) > 20) errors.creatinine = "Enter a valid creatinine value.";
    if (Number(form.hemoglobin) < 0 || Number(form.hemoglobin) > 25) errors.hemoglobin = "Enter a valid hemoglobin value.";
    if (Number(form.sodium) < 100 || Number(form.sodium) > 180) errors.sodium = "Enter a valid sodium value.";
    if (Number(form.potassium) < 1 || Number(form.potassium) > 10) errors.potassium = "Enter a valid potassium value.";
    if (Number(form.followupMonths) < 1) errors.followupMonths = "Follow-up period must be at least 1 month.";
    if (Number(form.visitCount) < 2) errors.visitCount = "At least 2 visits are needed.";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleReset = () => {
    setForm(defaultForm);
    setResult(null);
    setApiError("");
    setValidationErrors({});
  };

  const handlePredict = async () => {
    setApiError("");

    const isValid = validateForm();
    if (!isValid) {
      setResult(null);
      scrollToSection("predictor");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        let msg = "Prediction failed. Please make sure the backend is running.";
        try {
          const errData = await response.json();
          if (errData?.detail) {
            msg = typeof errData.detail === "string" ? errData.detail : JSON.stringify(errData.detail);
          }
        } catch {}
        throw new Error(msg);
      }

      const data = await response.json();
      setResult(data);
      setApiError("");
      scrollToSection("insights");
    } catch (error) {
      setResult(null);
      setApiError(error.message || "Prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  const analytics = useMemo(() => {
    const egfrFirst = Number(form.egfrFirst);
    const egfrLast = Number(form.egfrLast);
    const uacrFirst = Number(form.uacrFirst);
    const uacrLast = Number(form.uacrLast);
    const bpSys = Number(form.bpSys);
    const bpDia = Number(form.bpDia);
    const creatinine = Number(form.creatinine);
    const hemoglobin = Number(form.hemoglobin);
    const followupMonths = Number(form.followupMonths);

    const egfrChange = egfrLast - egfrFirst;
    const egfrPctChange = egfrFirst !== 0 ? ((egfrLast - egfrFirst) / egfrFirst) * 100 : 0;
    const egfrSlope = followupMonths !== 0 ? egfrChange / followupMonths : 0;

    const uacrChange = uacrLast - uacrFirst;
    const uacrPctChange = uacrFirst !== 0 ? ((uacrLast - uacrFirst) / uacrFirst) * 100 : 0;

    let ckdStage = "G1";
    if (egfrLast >= 90) ckdStage = "G1";
    else if (egfrLast >= 60) ckdStage = "G2";
    else if (egfrLast >= 45) ckdStage = "G3a";
    else if (egfrLast >= 30) ckdStage = "G3b";
    else if (egfrLast >= 15) ckdStage = "G4";
    else ckdStage = "G5";

    const reasons = [];
    if (egfrLast < 45) reasons.push("Latest kidney function score is low");
    if (egfrPctChange <= -10) reasons.push("Kidney function has dropped noticeably over time");
    if (uacrLast > 300) reasons.push("Urine protein level is high");
    if (bpSys >= 140 || bpDia >= 90) reasons.push("Blood pressure is higher than normal");
    if (form.diabetes === "Yes") reasons.push("Diabetes history is present");
    if (form.hypertension === "Yes") reasons.push("High blood pressure history is present");
    if (creatinine >= 2) reasons.push("Creatinine level is high");
    if (hemoglobin < 11) reasons.push("Hemoglobin level is low");

    const clinicalRadar = [
      { metric: "Kidney score risk", value: Math.min(100, Math.max(10, 100 - egfrLast)) },
      { metric: "Urine protein risk", value: Math.min(100, uacrLast / 6) },
      { metric: "BP risk", value: Math.min(100, (bpSys + bpDia) / 2) },
      { metric: "Creatinine", value: Math.min(100, creatinine * 25) },
      { metric: "Blood level", value: Math.min(100, Math.max(0, 22 - hemoglobin) * 8) },
      {
        metric: "Other risks",
        value: (form.diabetes === "Yes" ? 35 : 10) + (form.hypertension === "Yes" ? 30 : 5),
      },
    ];

    const trendSeries = [
      { name: "Visit 1", kidneyScore: egfrFirst, urineProtein: uacrFirst / 10 },
      {
        name: "Visit 2",
        kidneyScore: (egfrFirst + egfrLast) / 2,
        urineProtein: (uacrFirst + uacrLast) / 20,
      },
      { name: "Visit 3", kidneyScore: egfrLast, urineProtein: uacrLast / 10 },
    ];

    return {
      egfrChange,
      egfrPctChange,
      egfrSlope,
      uacrChange,
      uacrPctChange,
      ckdStage,
      reasons,
      clinicalRadar,
      trendSeries,
    };
  }, [form]);

  const predictionLabelMap = {
    stable: "Stable",
    slow_progression: "Worsening slowly",
    rapid_progression: "Worsening rapidly",
  };

  const displayPrediction = predictionLabelMap[result?.prediction] || "Waiting for prediction";
  const stable = Math.round((result?.probabilities?.stable || 0) * 100);
  const slow = Math.round((result?.probabilities?.slow_progression || 0) * 100);
  const rapid = Math.round((result?.probabilities?.rapid_progression || 0) * 100);

  const riskColor =
    result?.prediction === "rapid_progression"
      ? "#fb7185"
      : result?.prediction === "slow_progression"
      ? "#f59e0b"
      : "#34d399";

  const probabilityData = [
    { name: "Stable", value: stable },
    { name: "Slow", value: slow },
    { name: "Rapid", value: rapid },
  ];

  return (
    <div className="shell">
      <style>{styles}</style>

      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <div className="bg-grid" />

      <aside className="sidebar glass">
        <div className="brand">
          <div className="brand-icon">
            <Stethoscope size={20} />
          </div>
          <div>
            <div className="brand-title">NephroSense AI</div>
            <div className="brand-sub">Kidney Health Predictor</div>
          </div>
        </div>

        <nav className="side-nav">
          <NavItem icon={<Activity size={18} />} label="Home" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} active />
          <NavItem icon={<Brain size={18} />} label="Enter Details" onClick={() => scrollToSection("predictor")} />
          <NavItem icon={<TrendingDown size={18} />} label="Health Trends" onClick={() => scrollToSection("analytics")} />
          <NavItem icon={<ShieldCheck size={18} />} label="Prediction Result" onClick={() => scrollToSection("insights")} />
          <NavItem icon={<Stethoscope size={18} />} label="Advice Panel" onClick={() => scrollToSection("review")} />
        </nav>

        <div className="side-card glass-soft">
          <div className="side-card-title">System Status</div>
          <div className="status-line">
            <span className="dot ok" /> Form Ready
          </div>
          <div className="status-line">
            <span className={`dot ${loading ? "warn" : "ok"}`} /> {loading ? "Checking..." : "Ready"}
          </div>
          <div className="status-line">
            <span className={`dot ${result ? "ok" : "warn"}`} /> {result ? "Result Ready" : "No Result Yet"}
          </div>
        </div>
      </aside>

      <main className="main">
        <section className="hero glass">
          <div className="hero-copy">
            <div className="pill">
              <Brain size={14} /> AI-Based Kidney Health Check
            </div>
            <h1>Kidney Disease Progression Predictor</h1>
            <p>
              This dashboard helps estimate whether kidney disease is likely to stay stable,
              get worse slowly, or get worse quickly using blood test, urine test, and health history values.
            </p>

            <div className="hero-tags">
              <span>Easy Input</span>
              <span>Prediction Result</span>
              <span>Simple Charts</span>
              <span>Health Risk View</span>
            </div>
          </div>

          <div className="hero-stats">
            <StatCard icon={<Activity size={18} />} label="Kidney Stage" value={analytics.ckdStage} sub="Based on latest kidney function score" />
            <StatCard icon={<UserRound size={18} />} label="Visits Tracked" value={`${form.visitCount} visits`} sub={`${form.followupMonths} months`} />
            <StatCard icon={<HeartPulse size={18} />} label="High Risk Chance" value={`${rapid}%`} sub="Rapid worsening probability" accent />
          </div>
        </section>

        <section className="content-grid">
          <div className="left-column">
            <div className="panel glass" ref={predictorRef}>
              <div className="panel-head">
                <div>
                  <h2>Enter Patient Details</h2>
                  <p>Fill in the health information below to get a kidney risk prediction.</p>
                </div>
                <div className="head-badge">Connected to Backend</div>
              </div>

              <div className="form-grid">
                <Input label="Patient Name / ID" helper="Optional" value={form.name} onChange={(e) => handleChange("name", e.target.value)} />
                <Input label="Age" helper="In years" type="number" value={form.age} onChange={(e) => handleChange("age", Number(e.target.value))} error={validationErrors.age} />
                <Select label="Sex" helper="Select patient sex" value={form.sex} onChange={(e) => handleChange("sex", e.target.value)} options={["Male", "Female"]} />

                <Input label="Weight (kg)" helper="Body weight in kilograms" type="number" value={form.weight} onChange={(e) => handleChange("weight", Number(e.target.value))} error={validationErrors.weight} />
                <Select label="Diabetes" helper="Does the patient have diabetes?" value={form.diabetes} onChange={(e) => handleChange("diabetes", e.target.value)} options={["Yes", "No"]} />
                <Select label="High Blood Pressure" helper="History of hypertension" value={form.hypertension} onChange={(e) => handleChange("hypertension", e.target.value)} options={["Yes", "No"]} />

                <Select label="Smoking" helper="Smoking history" value={form.smoking} onChange={(e) => handleChange("smoking", e.target.value)} options={["Yes", "No"]} />
                <Select label="Kidney/BP Protection Medicine" helper="RAAS blocker use" value={form.raasBlocker} onChange={(e) => handleChange("raasBlocker", e.target.value)} options={["Yes", "No"]} />
                <Input label="Number of Visits" helper="How many visits are available?" type="number" value={form.visitCount} onChange={(e) => handleChange("visitCount", Number(e.target.value))} error={validationErrors.visitCount} />

                <Input label="Follow-up Time (months)" helper="Months between visits" type="number" value={form.followupMonths} onChange={(e) => handleChange("followupMonths", Number(e.target.value))} error={validationErrors.followupMonths} />
                <Input label="First Kidney Function Score (eGFR)" helper="Earlier kidney function value" type="number" value={form.egfrFirst} onChange={(e) => handleChange("egfrFirst", Number(e.target.value))} error={validationErrors.egfrFirst} />
                <Input label="Latest Kidney Function Score (eGFR)" helper="Most recent kidney function value" type="number" value={form.egfrLast} onChange={(e) => handleChange("egfrLast", Number(e.target.value))} error={validationErrors.egfrLast} />

                <Input label="First Urine Protein Level (UACR)" helper="Earlier urine protein value" type="number" value={form.uacrFirst} onChange={(e) => handleChange("uacrFirst", Number(e.target.value))} error={validationErrors.uacrFirst} />
                <Input label="Latest Urine Protein Level (UACR)" helper="Most recent urine protein value" type="number" value={form.uacrLast} onChange={(e) => handleChange("uacrLast", Number(e.target.value))} error={validationErrors.uacrLast} />
                <Input label="Top Blood Pressure Number" helper="Systolic BP" type="number" value={form.bpSys} onChange={(e) => handleChange("bpSys", Number(e.target.value))} error={validationErrors.bpSys} />

                <Input label="Bottom Blood Pressure Number" helper="Diastolic BP" type="number" value={form.bpDia} onChange={(e) => handleChange("bpDia", Number(e.target.value))} error={validationErrors.bpDia} />
                <Input label="Creatinine Level" helper="Blood creatinine test value" type="number" step="0.01" value={form.creatinine} onChange={(e) => handleChange("creatinine", Number(e.target.value))} error={validationErrors.creatinine} />
                <Input label="Hemoglobin Level" helper="Blood hemoglobin test value" type="number" step="0.1" value={form.hemoglobin} onChange={(e) => handleChange("hemoglobin", Number(e.target.value))} error={validationErrors.hemoglobin} />

                <Input label="Sodium Level" helper="Blood sodium value" type="number" step="0.1" value={form.sodium} onChange={(e) => handleChange("sodium", Number(e.target.value))} error={validationErrors.sodium} />
                <Input label="Potassium Level" helper="Blood potassium value" type="number" step="0.1" value={form.potassium} onChange={(e) => handleChange("potassium", Number(e.target.value))} error={validationErrors.potassium} />
              </div>

              <div className="action-row">
                <button className="btn primary" onClick={handlePredict} disabled={loading}>
                  {loading ? "Checking..." : "Check Prediction"}
                </button>
                <button className="btn secondary" onClick={handleReset} disabled={loading}>
                  Reset Form
                </button>
              </div>

              {apiError && (
                <div className="alert-box mt16">
                  <AlertTriangle size={18} /> {apiError}
                </div>
              )}
            </div>

            <div className="two-col" ref={analyticsRef}>
              <div className="panel glass">
                <div className="panel-head compact">
                  <div>
                    <h2>Health Trend Chart</h2>
                    <p>Shows how kidney score and urine protein values are changing over visits.</p>
                  </div>
                </div>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={analytics.trendSeries}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip />
                      <Line type="monotone" dataKey="kidneyScore" stroke="#22d3ee" strokeWidth={3} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="urineProtein" stroke="#f472b6" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel glass">
                <div className="panel-head compact">
                  <div>
                    <h2>Risk Overview Chart</h2>
                    <p>Shows which health factors are contributing more to the prediction.</p>
                  </div>
                </div>
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={260}>
                    <RadarChart data={analytics.clinicalRadar}>
                      <PolarGrid stroke="rgba(255,255,255,0.12)" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                      <Radar dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.45} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          <div className="right-column" ref={insightsRef}>
            <div className="panel glass prediction-panel">
              <div className="prediction-top">
                <div>
                  <div className="eyebrow">Prediction Result</div>
                  <h2>{displayPrediction}</h2>
                  <p>This result is based on the details entered above.</p>
                </div>
                <div className="score-ring" style={{ borderColor: riskColor }}>
                  <div className="score-ring-inner">
                    <div className="score-value" style={{ color: riskColor }}>
                      {rapid}%
                    </div>
                    <div className="score-label">Rapid Risk</div>
                  </div>
                </div>
              </div>

              <div className="mini-bars">
                {probabilityData.map((item) => (
                  <div key={item.name} className="mini-bar-card">
                    <div className="mini-bar-label-row">
                      <span>{item.name}</span>
                      <strong>{item.value}%</strong>
                    </div>
                    <div className="mini-bar-track">
                      <div className="mini-bar-fill" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel glass">
              <div className="panel-head compact">
                <div>
                  <h2>Prediction Confidence</h2>
                  <p>Shows how strongly the model supports each result type.</p>
                </div>
              </div>
              <div className="chart-wrap">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={probabilityData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#22d3ee" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="panel glass">
              <div className="panel-head compact">
                <div>
                  <h2>Main Reasons</h2>
                  <p>These are the main health factors affecting the result.</p>
                </div>
              </div>
              <div className="reason-list">
                {analytics.reasons.length > 0 ? (
                  analytics.reasons.map((reason, idx) => (
                    <div className="reason-item" key={idx}>
                      <div className="reason-icon">
                        <Droplets size={14} />
                      </div>
                      <div>
                        <div className="reason-title">{reason}</div>
                        <div className="reason-sub">
                          This factor may increase the risk of kidney disease worsening.
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="reason-item">
                    <div className="reason-icon">
                      <Droplets size={14} />
                    </div>
                    <div>
                      <div className="reason-title">No major risk signals found</div>
                      <div className="reason-sub">Current values do not show strong high-risk patterns.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="panel glass" ref={reviewRef}>
              <div className="panel-head compact">
                <div>
                  <h2>Advice Panel</h2>
                  <p>This is a simple educational message for project demonstration.</p>
                </div>
                <div className="warn-pill">Not medical advice</div>
              </div>
              <div className="recommendation-box">
                {!result &&
                  "Click the prediction button to see an advice message based on the entered values."}
                {result?.prediction === "stable" &&
                  "This result suggests the kidney condition may be relatively stable right now. Regular follow-up and routine checking are still important."}
                {result?.prediction === "slow_progression" &&
                  "This result suggests the kidney condition may be getting worse slowly. Closer follow-up and repeat testing may be needed."}
                {result?.prediction === "rapid_progression" &&
                  "This result suggests the kidney condition may be getting worse quickly. In a real setting, this type of case would need urgent medical review."}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button type="button" className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`stat-card ${accent ? "accent" : ""}`}>
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-sub">{sub}</div>
      </div>
    </div>
  );
}

function Input({ label, helper, error, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {helper ? <small className="helper-text">{helper}</small> : null}
      <input {...props} className={error ? "input-error" : ""} />
      {error ? <small className="error-text">{error}</small> : null}
    </label>
  );
}

function Select({ label, helper, options, error, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {helper ? <small className="helper-text">{helper}</small> : null}
      <select {...props} className={error ? "input-error" : ""}>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      {error ? <small className="error-text">{error}</small> : null}
    </label>
  );
}

const styles = `
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    background: #07111d;
    color: #fff;
  }
  .shell {
    min-height: 100vh;
    position: relative;
    display: grid;
    grid-template-columns: 280px 1fr;
    overflow: hidden;
  }
  .bg-orb {
    position: fixed;
    border-radius: 999px;
    filter: blur(60px);
    opacity: .35;
    pointer-events: none;
  }
  .orb-1 {
    width: 420px;
    height: 420px;
    background: #1d4ed8;
    top: -140px;
    right: 10%;
  }
  .orb-2 {
    width: 380px;
    height: 380px;
    background: #7c3aed;
    bottom: -120px;
    left: 16%;
  }
  .bg-grid {
    position: fixed;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
    background-size: 40px 40px;
    mask-image: radial-gradient(circle at center, black 45%, transparent 90%);
    pointer-events: none;
  }
  .glass {
    background: rgba(10, 18, 34, 0.62);
    backdrop-filter: blur(18px);
    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 20px 50px rgba(0,0,0,.28);
  }
  .glass-soft {
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.06);
  }
  .sidebar {
    padding: 24px;
    position: sticky;
    top: 0;
    height: 100vh;
    z-index: 3;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
    padding-bottom: 22px;
    border-bottom: 1px solid rgba(255,255,255,.08);
  }
  .brand-icon {
    width: 44px;
    height: 44px;
    border-radius: 16px;
    background: linear-gradient(135deg, #22d3ee, #3b82f6);
    display: grid;
    place-items: center;
    color: white;
  }
  .brand-title { font-weight: 800; letter-spacing: .3px; }
  .brand-sub { color: #94a3b8; font-size: 13px; margin-top: 2px; }
  .side-nav { display: grid; gap: 10px; margin: 22px 0; }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 16px;
    color: #cbd5e1;
    transition: .25s ease;
    background: transparent;
    border: none;
    width: 100%;
    cursor: pointer;
    text-align: left;
    font: inherit;
  }
  .nav-item:hover, .nav-item.active {
    background: rgba(255,255,255,.06);
    transform: translateX(4px);
    color: white;
  }
  .side-card { border-radius: 20px; padding: 18px; margin-top: 18px; }
  .side-card-title { font-weight: 700; margin-bottom: 14px; }
  .status-line {
    color: #cbd5e1;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    display: inline-block;
  }
  .dot.ok { background: #34d399; box-shadow: 0 0 12px #34d399; }
  .dot.warn { background: #f59e0b; box-shadow: 0 0 12px #f59e0b; }
  .main { padding: 24px; z-index: 2; }
  .hero {
    border-radius: 30px;
    padding: 30px;
    display: grid;
    grid-template-columns: 1.15fr .85fr;
    gap: 24px;
    position: relative;
    overflow: hidden;
  }
  .hero:before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at top left, rgba(34,211,238,.18), transparent 35%),
      radial-gradient(circle at bottom right, rgba(124,58,237,.18), transparent 35%);
    pointer-events: none;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(34,211,238,.12);
    color: #67e8f9;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .06em;
  }
  .hero h1 {
    margin: 18px 0 0;
    font-size: 48px;
    line-height: 1.08;
    max-width: 800px;
  }
  .hero p {
    margin: 16px 0 0;
    max-width: 760px;
    color: #cbd5e1;
    line-height: 1.75;
    font-size: 16px;
  }
  .hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 22px;
  }
  .hero-tags span {
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,.05);
    color: #e2e8f0;
    border: 1px solid rgba(255,255,255,.07);
  }
  .hero-stats { display: grid; gap: 14px; }
  .stat-card {
    border-radius: 22px;
    padding: 18px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.08);
    display: flex;
    align-items: center;
    gap: 14px;
    transition: .25s ease;
  }
  .stat-card:hover { transform: translateY(-4px); }
  .stat-card.accent {
    background: linear-gradient(135deg, rgba(34,211,238,.14), rgba(59,130,246,.14));
  }
  .stat-icon {
    width: 44px;
    height: 44px;
    border-radius: 16px;
    background: rgba(255,255,255,.07);
    display: grid;
    place-items: center;
    color: #67e8f9;
  }
  .stat-label { color: #94a3b8; font-size: 13px; }
  .stat-value { font-size: 28px; font-weight: 800; margin-top: 2px; }
  .stat-sub { color: #64748b; font-size: 13px; margin-top: 4px; }
  .content-grid {
    display: grid;
    grid-template-columns: 1.08fr .92fr;
    gap: 24px;
    margin-top: 24px;
  }
  .left-column, .right-column, .two-col {
    display: grid;
    gap: 24px;
  }
  .two-col { grid-template-columns: 1fr 1fr; }
  .panel {
    border-radius: 28px;
    padding: 24px;
  }
  .panel-head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }
  .panel-head.compact { margin-bottom: 14px; }
  .panel h2 { margin: 0; font-size: 26px; }
  .panel p { margin: 6px 0 0; color: #94a3b8; }
  .head-badge, .warn-pill {
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,.06);
    font-size: 12px;
    font-weight: 700;
    color: #e2e8f0;
    white-space: nowrap;
  }
  .warn-pill {
    background: rgba(245,158,11,.12);
    color: #fcd34d;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  .field { display: grid; gap: 6px; }
  .field span {
    font-size: 13px;
    color: #cbd5e1;
    font-weight: 600;
  }
  .helper-text {
    color: #94a3b8;
    font-size: 11px;
    line-height: 1.4;
  }
  .field input, .field select {
    width: 100%;
    padding: 13px 14px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,.1);
    background: rgba(255,255,255,.045);
    color: white;
    outline: none;
    transition: .2s ease;
  }
  .field input:focus, .field select:focus {
    border-color: rgba(34,211,238,.75);
    box-shadow: 0 0 0 4px rgba(34,211,238,.12);
  }
  .field select option { color: black; }
  .input-error {
    border-color: rgba(244,63,94,.8) !important;
    box-shadow: 0 0 0 4px rgba(244,63,94,.12) !important;
  }
  .error-text {
    color: #fda4af;
    font-size: 12px;
    line-height: 1.4;
  }
  .action-row {
    display: flex;
    gap: 12px;
    margin-top: 22px;
  }
  .btn {
    border: none;
    border-radius: 16px;
    padding: 13px 18px;
    font-weight: 800;
    cursor: pointer;
    transition: .2s ease;
  }
  .btn:hover:not(:disabled) { transform: translateY(-2px); }
  .btn:disabled {
    opacity: .7;
    cursor: not-allowed;
  }
  .btn.primary {
    background: linear-gradient(135deg, #22d3ee, #3b82f6);
    color: white;
    box-shadow: 0 12px 28px rgba(34,211,238,.25);
  }
  .btn.secondary {
    background: rgba(255,255,255,.05);
    color: white;
    border: 1px solid rgba(255,255,255,.08);
  }
  .prediction-panel { overflow: hidden; }
  .prediction-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }
  .eyebrow {
    color: #67e8f9;
    text-transform: uppercase;
    letter-spacing: .12em;
    font-size: 12px;
    font-weight: 700;
  }
  .score-ring {
    width: 120px;
    height: 120px;
    border-radius: 999px;
    border: 8px solid #22d3ee;
    display: grid;
    place-items: center;
    background: rgba(255,255,255,.03);
    box-shadow: inset 0 0 20px rgba(255,255,255,.05);
  }
  .score-ring-inner {
    width: 88px;
    height: 88px;
    border-radius: 999px;
    background: #08111f;
    display: grid;
    place-items: center;
    text-align: center;
  }
  .score-value {
    font-size: 28px;
    font-weight: 800;
    line-height: 1;
  }
  .score-label {
    font-size: 11px;
    color: #94a3b8;
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: .08em;
  }
  .alert-box {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 16px;
    background: rgba(244,63,94,.12);
    color: #fecdd3;
    border: 1px solid rgba(244,63,94,.18);
  }
  .mt16 { margin-top: 16px; }
  .mini-bars {
    display: grid;
    gap: 14px;
    margin-top: 22px;
  }
  .mini-bar-card {
    padding: 14px;
    border-radius: 18px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.06);
  }
  .mini-bar-label-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    color: #e2e8f0;
  }
  .mini-bar-track {
    height: 11px;
    background: rgba(255,255,255,.08);
    border-radius: 999px;
    overflow: hidden;
  }
  .mini-bar-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, #22d3ee, #8b5cf6);
    animation: grow 1.1s ease;
  }
  .chart-wrap {
    height: 260px;
    margin-top: 10px;
  }
  .reason-list { display: grid; gap: 12px; }
  .reason-item {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    padding: 14px;
    border-radius: 18px;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.06);
  }
  .reason-icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: rgba(34,211,238,.12);
    display: grid;
    place-items: center;
    color: #67e8f9;
    flex-shrink: 0;
  }
  .reason-title { font-weight: 700; }
  .reason-sub {
    color: #94a3b8;
    font-size: 13px;
    margin-top: 3px;
  }
  .recommendation-box {
    margin-top: 8px;
    padding: 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(255,255,255,.04), rgba(255,255,255,.02));
    color: #dbeafe;
    line-height: 1.8;
    border: 1px solid rgba(255,255,255,.06);
  }
  @keyframes grow {
    from { width: 0; }
  }
  @media (max-width: 1280px) {
    .content-grid { grid-template-columns: 1fr; }
    .hero { grid-template-columns: 1fr; }
  }
  @media (max-width: 1080px) {
    .shell { grid-template-columns: 1fr; }
    .sidebar { position: relative; height: auto; }
    .form-grid, .two-col { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 760px) {
    .main { padding: 16px; }
    .hero h1 { font-size: 34px; }
    .form-grid, .two-col, .hero-stats { grid-template-columns: 1fr; }
    .prediction-top { flex-direction: column; align-items: flex-start; }
  }
`;
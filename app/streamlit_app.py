import sys
import os
import streamlit as st
import pandas as pd

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.append(project_root)

from src.predict import predict_single_patient

st.set_page_config(page_title="CKD Progression Predictor", layout="wide")

st.title("AI Chronic Kidney Disease Progression Predictor")
st.caption("Educational clinical decision-support prototype")

col1, col2, col3 = st.columns(3)

with col1:
    age = st.number_input("Age", 18, 100, 58)
    sex = st.selectbox("Sex", ["Male", "Female"])
    weight = st.number_input("Weight (kg)", 30.0, 200.0, 72.0)
    diabetes = st.selectbox("Diabetes", ["Yes", "No"])
    hypertension = st.selectbox("Hypertension", ["Yes", "No"])

with col2:
    smoking = st.selectbox("Smoking", ["Yes", "No"])
    raasBlocker = st.selectbox("RAAS Blocker", ["Yes", "No"])
    sodium = st.number_input("Sodium", 100.0, 160.0, 138.0)
    potassium = st.number_input("Potassium", 2.0, 7.0, 4.8)
    visitCount = st.number_input("Visit Count", 1, 20, 3)

with col3:
    followupMonths = st.number_input("Months of Follow-up", 1.0, 60.0, 8.0)
    egfrFirst = st.number_input("First eGFR", 0.0, 150.0, 42.0)
    egfrLast = st.number_input("Latest eGFR", 0.0, 150.0, 35.0)
    uacrFirst = st.number_input("First UACR", 0.0, 5000.0, 320.0)
    uacrLast = st.number_input("Latest UACR", 0.0, 5000.0, 410.0)

bpSys = st.number_input("Systolic BP", 80.0, 250.0, 150.0)
bpDia = st.number_input("Diastolic BP", 40.0, 150.0, 95.0)
creatinine = st.number_input("Serum Creatinine", 0.1, 15.0, 2.2)
hemoglobin = st.number_input("Hemoglobin", 3.0, 20.0, 10.5)

if st.button("Predict Progression"):
    input_dict = {
        "name": "",
        "age": age,
        "sex": sex,
        "weight": weight,
        "diabetes": diabetes,
        "hypertension": hypertension,
        "smoking": smoking,
        "raasBlocker": raasBlocker,
        "egfrFirst": egfrFirst,
        "egfrLast": egfrLast,
        "uacrFirst": uacrFirst,
        "uacrLast": uacrLast,
        "bpSys": bpSys,
        "bpDia": bpDia,
        "creatinine": creatinine,
        "hemoglobin": hemoglobin,
        "sodium": sodium,
        "potassium": potassium,
        "followupMonths": followupMonths,
        "visitCount": visitCount,
    }

    try:
        pred_label, prob_dict = predict_single_patient(input_dict)

        st.success(f"Prediction: {pred_label}")

        prob_df = pd.DataFrame({
            "Class": list(prob_dict.keys()),
            "Probability": list(prob_dict.values())
        })
        st.bar_chart(prob_df.set_index("Class"))

        st.subheader("Clinical Summary")

        if egfrLast >= 90:
            stage = "G1"
        elif egfrLast >= 60:
            stage = "G2"
        elif egfrLast >= 45:
            stage = "G3a"
        elif egfrLast >= 30:
            stage = "G3b"
        elif egfrLast >= 15:
            stage = "G4"
        else:
            stage = "G5"

        st.write(f"**CKD Stage (approx):** {stage}")
        st.write(f"**eGFR change:** {round(egfrLast - egfrFirst, 2)}")
        st.write(f"**UACR change:** {round(uacrLast - uacrFirst, 2)}")

        reasons = []
        if egfrLast < 45:
            reasons.append("Low latest eGFR")
        if uacrLast > 300:
            reasons.append("High albuminuria / UACR")
        if bpSys >= 140 or bpDia >= 90:
            reasons.append("High blood pressure")
        if diabetes == "Yes":
            reasons.append("Diabetes present")
        if hemoglobin < 11:
            reasons.append("Low hemoglobin")

        st.subheader("Possible Risk Drivers")
        if reasons:
            for reason in reasons:
                st.write("-", reason)
        else:
            st.write("No major rule-based risk pattern detected.")

    except Exception as e:
        st.error(f"Prediction failed: {e}")
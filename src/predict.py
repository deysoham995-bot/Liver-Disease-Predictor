from pathlib import Path
from functools import lru_cache
import joblib
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"


def _yes_no_to_int(value):
    if isinstance(value, str):
        return 1 if value.strip().lower() == "yes" else 0
    return int(value)


def _sex_to_model_value(value):
    if isinstance(value, str):
        return "M" if value.strip().lower() in ["male", "m"] else "F"
    return "F"


def _safe_pct_change(first, last):
    return ((last - first) / first) * 100 if first != 0 else 0


def _safe_div(a, b):
    return a / b if b not in [0, None] else 0


def validate_input(data):
    required_fields = [
        "age", "sex", "weight", "diabetes", "hypertension", "smoking",
        "raasBlocker", "egfrFirst", "egfrLast", "uacrFirst", "uacrLast",
        "bpSys", "bpDia", "creatinine", "hemoglobin", "sodium",
        "potassium", "followupMonths", "visitCount"
    ]

    missing = [field for field in required_fields if field not in data]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    if float(data["followupMonths"]) <= 0:
        raise ValueError("Follow-up months must be greater than 0.")

    if float(data["egfrFirst"]) < 0 or float(data["egfrLast"]) < 0:
        raise ValueError("eGFR values cannot be negative.")

    if float(data["uacrFirst"]) < 0 or float(data["uacrLast"]) < 0:
        raise ValueError("UACR values cannot be negative.")

    if int(data["visitCount"]) < 1:
        raise ValueError("Visit count must be at least 1.")


def build_feature_dict(data):
    egfr_first = float(data["egfrFirst"])
    egfr_last = float(data["egfrLast"])
    uacr_first = float(data["uacrFirst"])
    uacr_last = float(data["uacrLast"])
    months_followup = float(data["followupMonths"])

    egfr_min = min(egfr_first, egfr_last)
    egfr_max = max(egfr_first, egfr_last)
    egfr_mean = (egfr_first + egfr_last) / 2
    egfr_std = abs(egfr_first - egfr_last) / 2
    egfr_change = egfr_last - egfr_first
    egfr_pct_change = _safe_pct_change(egfr_first, egfr_last)
    egfr_slope_per_month = _safe_div(egfr_change, months_followup)

    uacr_mean = (uacr_first + uacr_last) / 2
    uacr_change = uacr_last - uacr_first
    uacr_pct_change = _safe_pct_change(uacr_first, uacr_last)

    bp_sys = float(data["bpSys"])
    bp_dia = float(data["bpDia"])

    return {
        "age_last": int(data["age"]),
        "sex": _sex_to_model_value(data["sex"]),
        "weight_last": float(data["weight"]),
        "diabetes": _yes_no_to_int(data["diabetes"]),
        "hypertension": _yes_no_to_int(data["hypertension"]),
        "smoking": _yes_no_to_int(data["smoking"]),
        "raas_blocker": _yes_no_to_int(data["raasBlocker"]),
        "sodium_last": float(data["sodium"]),
        "potassium_last": float(data["potassium"]),
        "visit_count": int(data["visitCount"]),
        "months_followup": months_followup,
        "egfr_first": egfr_first,
        "egfr_last": egfr_last,
        "egfr_min": egfr_min,
        "egfr_max": egfr_max,
        "egfr_mean": egfr_mean,
        "egfr_std": egfr_std,
        "egfr_change": egfr_change,
        "egfr_pct_change": egfr_pct_change,
        "egfr_slope_per_month": egfr_slope_per_month,
        "uacr_first": uacr_first,
        "uacr_last": uacr_last,
        "uacr_mean": uacr_mean,
        "uacr_change": uacr_change,
        "uacr_pct_change": uacr_pct_change,
        "bp_sys_mean": bp_sys,
        "bp_dia_mean": bp_dia,
        "bp_sys_last": bp_sys,
        "bp_dia_last": bp_dia,
        "creatinine_mean": float(data["creatinine"]),
        "hemoglobin_mean": float(data["hemoglobin"]),

        # extra risk features
        "pulse_pressure": bp_sys - bp_dia,
        "bp_ratio": _safe_div(bp_sys, bp_dia),
        "uacr_egfr_ratio": _safe_div(uacr_last, egfr_last),
    }


def prepare_input(data):
    validate_input(data)
    return pd.DataFrame([build_feature_dict(data)])


@lru_cache(maxsize=1)
def load_artifacts():
    pipeline = joblib.load(MODELS_DIR / "ckd_model.pkl")
    label_encoder = joblib.load(MODELS_DIR / "label_encoder.pkl")
    return pipeline, label_encoder


def predict_single_patient(data):
    pipeline, label_encoder = load_artifacts()
    df = prepare_input(data)

    pred_encoded = pipeline.predict(df)[0]
    pred_probs = pipeline.predict_proba(df)[0]
    pred_label = label_encoder.inverse_transform([pred_encoded])[0]

    prob_dict = {
        class_name: round(float(prob), 4)
        for class_name, prob in zip(label_encoder.classes_, pred_probs)
    }

    return pred_label, prob_dict
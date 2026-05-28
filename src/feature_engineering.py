import pandas as pd
import numpy as np

def calculate_month_gap(start_date, end_date):
    days = (end_date - start_date).days
    return max(days / 30.0, 1)

def build_patient_features(df: pd.DataFrame) -> pd.DataFrame:
    feature_rows = []

    for patient_id, group in df.groupby("patient_id"):
        group = group.sort_values("visit_date").copy()

        first = group.iloc[0]
        last = group.iloc[-1]

        visit_count = len(group)
        months_followup = calculate_month_gap(first["visit_date"], last["visit_date"])

        egfr_values = group["eGFR"].values
        uacr_values = group["UACR"].values

        egfr_first = first["eGFR"]
        egfr_last = last["eGFR"]
        egfr_min = group["eGFR"].min()
        egfr_max = group["eGFR"].max()
        egfr_mean = group["eGFR"].mean()
        egfr_std = group["eGFR"].std() if visit_count > 1 else 0
        egfr_change = egfr_last - egfr_first
        egfr_pct_change = ((egfr_last - egfr_first) / egfr_first) * 100 if egfr_first != 0 else 0
        egfr_slope_per_month = egfr_change / months_followup

        uacr_first = first["UACR"]
        uacr_last = last["UACR"]
        uacr_mean = group["UACR"].mean()
        uacr_change = uacr_last - uacr_first
        uacr_pct_change = ((uacr_last - uacr_first) / uacr_first) * 100 if uacr_first != 0 else 0

        bp_sys_mean = group["bp_sys"].mean()
        bp_dia_mean = group["bp_dia"].mean()
        bp_sys_last = last["bp_sys"]
        bp_dia_last = last["bp_dia"]

        creat_mean = group["serum_creatinine"].mean()
        hb_mean = group["hemoglobin"].mean()

        feature_rows.append({
            "patient_id": patient_id,

            # static or latest values
            "age_last": last["age"],
            "sex": last["sex"],
            "weight_last": last["weight"],
            "diabetes": last["diabetes"],
            "hypertension": last["hypertension"],
            "smoking": last["smoking"],
            "raas_blocker": last["raas_blocker"],
            "sodium_last": last["sodium"],
            "potassium_last": last["potassium"],

            # follow-up information
            "visit_count": visit_count,
            "months_followup": months_followup,

            # eGFR trend features
            "egfr_first": egfr_first,
            "egfr_last": egfr_last,
            "egfr_min": egfr_min,
            "egfr_max": egfr_max,
            "egfr_mean": egfr_mean,
            "egfr_std": egfr_std,
            "egfr_change": egfr_change,
            "egfr_pct_change": egfr_pct_change,
            "egfr_slope_per_month": egfr_slope_per_month,

            # UACR trend features
            "uacr_first": uacr_first,
            "uacr_last": uacr_last,
            "uacr_mean": uacr_mean,
            "uacr_change": uacr_change,
            "uacr_pct_change": uacr_pct_change,

            # BP and labs
            "bp_sys_mean": bp_sys_mean,
            "bp_dia_mean": bp_dia_mean,
            "bp_sys_last": bp_sys_last,
            "bp_dia_last": bp_dia_last,
            "creatinine_mean": creat_mean,
            "hemoglobin_mean": hb_mean,
            "pulse_pressure": bp_sys_last - bp_dia_last,
            "bp_ratio": (bp_sys_last / bp_dia_last) if bp_dia_last != 0 else 0,
            "uacr_egfr_ratio": (uacr_last / egfr_last) if egfr_last != 0 else 0,
        })

    return pd.DataFrame(feature_rows)
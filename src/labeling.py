import pandas as pd
import numpy as np

def create_progression_label(first_egfr: float, last_egfr: float) -> str:
    if pd.isna(first_egfr) or pd.isna(last_egfr) or first_egfr <= 0:
        return np.nan

    decline_pct = ((first_egfr - last_egfr) / first_egfr) * 100

    if decline_pct < 10:
        return "stable"
    elif decline_pct <= 20:
        return "slow_progression"
    else:
        return "rapid_progression"

def assign_labels(df: pd.DataFrame) -> pd.DataFrame:
    rows = []

    for patient_id, group in df.groupby("patient_id"):
        group = group.sort_values("visit_date")

        first_row = group.iloc[0]
        last_row = group.iloc[-1]

        label = create_progression_label(first_row["eGFR"], last_row["eGFR"])

        rows.append({
            "patient_id": patient_id,
            "target": label
        })

    labels_df = pd.DataFrame(rows)
    return labels_df
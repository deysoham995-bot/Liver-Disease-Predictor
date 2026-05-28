import pandas as pd

def load_data(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df["visit_date"] = pd.to_datetime(df["visit_date"])
    df = df.sort_values(["patient_id", "visit_date"]).reset_index(drop=True)
    return df
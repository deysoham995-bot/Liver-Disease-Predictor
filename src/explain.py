import joblib
import shap
import pandas as pd

from src.data_loader import load_data
from src.feature_engineering import build_patient_features

def explain_predictions():
    pipeline = joblib.load("models/ckd_model.pkl")

    df = load_data("data/raw/ckd_visits.csv")
    features_df = build_patient_features(df)

    X = features_df.drop(columns=["patient_id"])

    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]

    X_processed = preprocessor.transform(X)

    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X_processed)

    print("SHAP explanation ready.")

if __name__ == "__main__":
    explain_predictions()
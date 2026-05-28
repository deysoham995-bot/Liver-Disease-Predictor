import os
import joblib
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, classification_report

from src.data_loader import load_data
from src.feature_engineering import build_patient_features
from src.labeling import assign_labels

def evaluate_model():
    os.makedirs("reports", exist_ok=True)

    pipeline = joblib.load("models/ckd_model.pkl")
    label_encoder = joblib.load("models/label_encoder.pkl")

    df = load_data("data/raw/ckd_visits.csv")
    features_df = build_patient_features(df)
    labels_df = assign_labels(df)

    dataset = features_df.merge(labels_df, on="patient_id", how="inner")
    dataset = dataset.dropna(subset=["target"]).reset_index(drop=True)

    X = dataset.drop(columns=["patient_id", "target"])
    y = label_encoder.transform(dataset["target"])

    y_pred = pipeline.predict(X)

    print(classification_report(y, y_pred, target_names=label_encoder.classes_))

    cm = confusion_matrix(y, y_pred)
    disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=label_encoder.classes_)
    disp.plot()
    plt.title("CKD Progression Confusion Matrix")
    plt.savefig("reports/confusion_matrix.png", bbox_inches="tight")
    plt.close()

    class_counts = dataset["target"].value_counts()
    plt.figure()
    class_counts.plot(kind="bar")
    plt.title("Class Distribution")
    plt.xlabel("Progression Class")
    plt.ylabel("Count")
    plt.savefig("reports/class_distribution.png", bbox_inches="tight")
    plt.close()

    model = pipeline.named_steps["model"]
    preprocessor = pipeline.named_steps["preprocessor"]

    feature_names = preprocessor.get_feature_names_out()
    importances = model.feature_importances_

    fi = pd.DataFrame({
        "feature": feature_names,
        "importance": importances
    }).sort_values("importance", ascending=False).head(15)

    plt.figure(figsize=(10, 6))
    plt.barh(fi["feature"], fi["importance"])
    plt.gca().invert_yaxis()
    plt.title("Top 15 Feature Importances")
    plt.xlabel("Importance")
    plt.savefig("reports/feature_importance.png", bbox_inches="tight")
    plt.close()

if __name__ == "__main__":
    evaluate_model()
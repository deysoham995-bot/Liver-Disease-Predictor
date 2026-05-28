import os
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, f1_score

from src.data_loader import load_data
from src.feature_engineering import build_patient_features
from src.labeling import assign_labels
from src.preprocess import get_preprocessor

def train_model():
    df = load_data("data/raw/ckd_visits.csv")

    features_df = build_patient_features(df)
    labels_df = assign_labels(df)

    dataset = features_df.merge(labels_df, on="patient_id", how="inner")
    dataset = dataset.dropna(subset=["target"]).reset_index(drop=True)

    os.makedirs("data/processed", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    os.makedirs("reports", exist_ok=True)

    dataset.to_csv("data/processed/patient_features.csv", index=False)

    X = dataset.drop(columns=["patient_id", "target"])
    y = dataset["target"]

    categorical_cols = ["sex", "diabetes", "hypertension", "smoking", "raas_blocker"]
    numeric_cols = [col for col in X.columns if col not in categorical_cols]

    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    class_counts = pd.Series(y_encoded).value_counts()
    print("Class counts:\n", class_counts)

    if class_counts.min() >= 2:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
    else:
        print("Warning: Some classes have fewer than 2 samples. Splitting without stratify.")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42
        )

    train_df = X_train.copy()
    train_df["target"] = y_train
    test_df = X_test.copy()
    test_df["target"] = y_test

    train_df.to_csv("data/processed/train_features.csv", index=False)
    test_df.to_csv("data/processed/test_features.csv", index=False)

    preprocessor = get_preprocessor(numeric_cols, categorical_cols)

    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", model)
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")

    all_labels = list(range(len(label_encoder.classes_)))

    report = classification_report(
        y_test,
        y_pred,
        labels=all_labels,
        target_names=label_encoder.classes_,
        zero_division=0
    )

    cm = confusion_matrix(
        y_test,
        y_pred,
        labels=all_labels
    )

    print("Accuracy:", acc)
    print("Weighted F1:", f1)
    print("\nClassification Report:\n", report)
    print("\nConfusion Matrix:\n", cm)

    joblib.dump(pipeline, "models/ckd_model.pkl")
    joblib.dump(label_encoder, "models/label_encoder.pkl")
    joblib.dump(list(X.columns), "models/feature_columns.pkl")

    with open("reports/metrics.txt", "w") as f:
        f.write(f"Accuracy: {acc}\n")
        f.write(f"Weighted F1 Score: {f1}\n\n")
        f.write("Classification Report:\n")
        f.write(report)
        f.write("\nConfusion Matrix:\n")
        f.write(str(cm))

if __name__ == "__main__":
    train_model()
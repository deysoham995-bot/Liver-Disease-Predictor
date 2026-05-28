import numpy as np
import pandas as pd

from src.preprocess import get_preprocessor


def test_get_preprocessor_returns_column_transformer():
    numeric_cols = ["age_last", "weight_last", "egfr_last"]
    categorical_cols = ["sex", "diabetes"]

    preprocessor = get_preprocessor(numeric_cols, categorical_cols)

    assert preprocessor is not None
    assert hasattr(preprocessor, "fit")
    assert hasattr(preprocessor, "transform")


def test_preprocessor_fits_and_transforms_data():
    df = pd.DataFrame({
        "age_last": [58, 45, 66],
        "weight_last": [72, 64, 75],
        "egfr_last": [35, 76, 44],
        "sex": ["M", "F", "M"],
        "diabetes": [1, 0, 1]
    })

    numeric_cols = ["age_last", "weight_last", "egfr_last"]
    categorical_cols = ["sex", "diabetes"]

    preprocessor = get_preprocessor(numeric_cols, categorical_cols)
    transformed = preprocessor.fit_transform(df)

    assert transformed.shape[0] == 3
    assert transformed.shape[1] > len(numeric_cols)


def test_preprocessor_handles_missing_values():
    df = pd.DataFrame({
        "age_last": [58, None, 66],
        "weight_last": [72, 64, None],
        "egfr_last": [35, 76, 44],
        "sex": ["M", None, "M"],
        "diabetes": [1, 0, None]
    })

    numeric_cols = ["age_last", "weight_last", "egfr_last"]
    categorical_cols = ["sex", "diabetes"]

    preprocessor = get_preprocessor(numeric_cols, categorical_cols)
    transformed = preprocessor.fit_transform(df)

    assert transformed.shape[0] == 3


def test_preprocessor_output_is_numeric():
    df = pd.DataFrame({
        "age_last": [58, 45],
        "weight_last": [72, 64],
        "egfr_last": [35, 76],
        "sex": ["M", "F"],
        "diabetes": [1, 0]
    })

    numeric_cols = ["age_last", "weight_last", "egfr_last"]
    categorical_cols = ["sex", "diabetes"]

    preprocessor = get_preprocessor(numeric_cols, categorical_cols)
    transformed = preprocessor.fit_transform(df)

    transformed_array = transformed.toarray() if hasattr(transformed, "toarray") else transformed

    assert np.issubdtype(transformed_array.dtype, np.number)


def test_preprocessor_feature_count_changes_due_to_onehot():
    df = pd.DataFrame({
        "age_last": [58, 45, 66],
        "weight_last": [72, 64, 75],
        "egfr_last": [35, 76, 44],
        "sex": ["M", "F", "M"],
        "diabetes": [1, 0, 1]
    })

    numeric_cols = ["age_last", "weight_last", "egfr_last"]
    categorical_cols = ["sex", "diabetes"]

    preprocessor = get_preprocessor(numeric_cols, categorical_cols)
    transformed = preprocessor.fit_transform(df)

    total_input_cols = len(numeric_cols) + len(categorical_cols)
    assert transformed.shape[1] >= total_input_cols
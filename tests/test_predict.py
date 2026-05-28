import pandas as pd
import pytest
from unittest.mock import Mock, patch

from src.predict import prepare_input, predict_single_patient


@pytest.fixture
def sample_patient_data():
    return {
        "name": "Patient001",
        "age": 58,
        "sex": "Male",
        "weight": 72,
        "diabetes": "Yes",
        "hypertension": "Yes",
        "smoking": "No",
        "raasBlocker": "Yes",
        "egfrFirst": 42,
        "egfrLast": 35,
        "uacrFirst": 320,
        "uacrLast": 410,
        "bpSys": 152,
        "bpDia": 94,
        "creatinine": 2.23,
        "hemoglobin": 10.5,
        "sodium": 138,
        "potassium": 4.8,
        "followupMonths": 8,
        "visitCount": 3
    }


def test_prepare_input_returns_dataframe(sample_patient_data):
    df = prepare_input(sample_patient_data)

    assert isinstance(df, pd.DataFrame)
    assert df.shape[0] == 1


def test_prepare_input_has_expected_columns(sample_patient_data):
    df = prepare_input(sample_patient_data)

    expected_columns = [
        "age_last",
        "sex",
        "weight_last",
        "diabetes",
        "hypertension",
        "smoking",
        "raas_blocker",
        "sodium_last",
        "potassium_last",
        "visit_count",
        "months_followup",
        "egfr_first",
        "egfr_last",
        "egfr_min",
        "egfr_max",
        "egfr_mean",
        "egfr_std",
        "egfr_change",
        "egfr_pct_change",
        "egfr_slope_per_month",
        "uacr_first",
        "uacr_last",
        "uacr_mean",
        "uacr_change",
        "uacr_pct_change",
        "bp_sys_mean",
        "bp_dia_mean",
        "bp_sys_last",
        "bp_dia_last",
        "creatinine_mean",
        "hemoglobin_mean"
    ]

    assert list(df.columns) == expected_columns


def test_prepare_input_numeric_calculations(sample_patient_data):
    df = prepare_input(sample_patient_data)

    assert df.loc[0, "egfr_first"] == 42
    assert df.loc[0, "egfr_last"] == 35
    assert df.loc[0, "egfr_min"] == 35
    assert df.loc[0, "egfr_max"] == 42
    assert df.loc[0, "egfr_mean"] == 38.5
    assert df.loc[0, "egfr_std"] == 3.5
    assert df.loc[0, "egfr_change"] == -7

    expected_pct = ((35 - 42) / 42) * 100
    assert round(df.loc[0, "egfr_pct_change"], 5) == round(expected_pct, 5)

    expected_slope = -7 / 8
    assert round(df.loc[0, "egfr_slope_per_month"], 5) == round(expected_slope, 5)

    assert df.loc[0, "uacr_first"] == 320
    assert df.loc[0, "uacr_last"] == 410
    assert df.loc[0, "uacr_mean"] == 365
    assert df.loc[0, "uacr_change"] == 90

    expected_uacr_pct = ((410 - 320) / 320) * 100
    assert round(df.loc[0, "uacr_pct_change"], 5) == round(expected_uacr_pct, 5)


def test_prepare_input_converts_categories(sample_patient_data):
    df = prepare_input(sample_patient_data)

    assert df.loc[0, "sex"] == "M"
    assert df.loc[0, "diabetes"] == 1
    assert df.loc[0, "hypertension"] == 1
    assert df.loc[0, "smoking"] == 0
    assert df.loc[0, "raas_blocker"] == 1


def test_prepare_input_handles_female_and_no_values(sample_patient_data):
    sample_patient_data["sex"] = "Female"
    sample_patient_data["diabetes"] = "No"
    sample_patient_data["hypertension"] = "No"
    sample_patient_data["smoking"] = "Yes"
    sample_patient_data["raasBlocker"] = "No"

    df = prepare_input(sample_patient_data)

    assert df.loc[0, "sex"] == "F"
    assert df.loc[0, "diabetes"] == 0
    assert df.loc[0, "hypertension"] == 0
    assert df.loc[0, "smoking"] == 1
    assert df.loc[0, "raas_blocker"] == 0


def test_prepare_input_followup_zero(sample_patient_data):
    sample_patient_data["followupMonths"] = 0

    df = prepare_input(sample_patient_data)

    assert df.loc[0, "egfr_slope_per_month"] == 0


def test_prepare_input_uacr_zero(sample_patient_data):
    sample_patient_data["uacrFirst"] = 0
    sample_patient_data["uacrLast"] = 100

    df = prepare_input(sample_patient_data)

    assert df.loc[0, "uacr_pct_change"] == 0


@patch("src.predict.joblib.load")
def test_predict_single_patient_returns_prediction_and_probabilities(mock_load, sample_patient_data):
    mock_pipeline = Mock()
    mock_pipeline.predict.return_value = [1]
    mock_pipeline.predict_proba.return_value = [[0.1, 0.3, 0.6]]

    mock_label_encoder = Mock()
    mock_label_encoder.inverse_transform.return_value = ["rapid_progression"]
    mock_label_encoder.classes_ = ["stable", "slow_progression", "rapid_progression"]

    mock_load.side_effect = [mock_pipeline, mock_label_encoder]

    pred_label, prob_dict = predict_single_patient(sample_patient_data)

    assert pred_label == "rapid_progression"
    assert isinstance(prob_dict, dict)
    assert prob_dict["stable"] == 0.1
    assert prob_dict["slow_progression"] == 0.3
    assert prob_dict["rapid_progression"] == 0.6


@patch("src.predict.joblib.load")
def test_predict_single_patient_calls_model_with_dataframe(mock_load, sample_patient_data):
    mock_pipeline = Mock()
    mock_pipeline.predict.return_value = [0]
    mock_pipeline.predict_proba.return_value = [[0.8, 0.1, 0.1]]

    mock_label_encoder = Mock()
    mock_label_encoder.inverse_transform.return_value = ["stable"]
    mock_label_encoder.classes_ = ["stable", "slow_progression", "rapid_progression"]

    mock_load.side_effect = [mock_pipeline, mock_label_encoder]

    predict_single_patient(sample_patient_data)

    args, kwargs = mock_pipeline.predict.call_args
    passed_df = args[0]

    assert isinstance(passed_df, pd.DataFrame)
    assert passed_df.shape[0] == 1
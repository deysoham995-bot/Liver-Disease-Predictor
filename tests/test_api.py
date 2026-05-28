from fastapi.testclient import TestClient
from unittest.mock import patch

from api.app import app

client = TestClient(app)


def test_home_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "CKD Predictor API running"}


def test_predict_endpoint_success():
    payload = {
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

    with patch("api.app.predict_single_patient") as mock_predict:
        mock_predict.return_value = (
            "rapid_progression",
            {
                "stable": 0.1,
                "slow_progression": 0.2,
                "rapid_progression": 0.7
            }
        )

        response = client.post("/predict", json=payload)

        assert response.status_code == 200

        data = response.json()
        assert "prediction" in data
        assert "probabilities" in data
        assert data["prediction"] == "rapid_progression"
        assert data["probabilities"]["stable"] == 0.1
        assert data["probabilities"]["slow_progression"] == 0.2
        assert data["probabilities"]["rapid_progression"] == 0.7


def test_predict_endpoint_missing_field():
    payload = {
        "name": "Patient001",
        "age": 58,
        "sex": "Male"
    }

    response = client.post("/predict", json=payload)

    assert response.status_code == 422


def test_predict_endpoint_calls_predict_function():
    payload = {
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

    with patch("api.app.predict_single_patient") as mock_predict:
        mock_predict.return_value = (
            "stable",
            {
                "stable": 0.8,
                "slow_progression": 0.1,
                "rapid_progression": 0.1
            }
        )

        response = client.post("/predict", json=payload)

        assert response.status_code == 200
        mock_predict.assert_called_once()


def test_predict_endpoint_response_types():
    payload = {
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

    with patch("api.app.predict_single_patient") as mock_predict:
        mock_predict.return_value = (
            "slow_progression",
            {
                "stable": 0.25,
                "slow_progression": 0.5,
                "rapid_progression": 0.25
            }
        )

        response = client.post("/predict", json=payload)
        data = response.json()

        assert isinstance(data["prediction"], str)
        assert isinstance(data["probabilities"], dict)
        assert isinstance(data["probabilities"]["stable"], float)
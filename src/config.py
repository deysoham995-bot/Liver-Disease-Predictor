TARGET_CLASSES = ["stable", "slow_progression", "rapid_progression"]

NUMERIC_COLUMNS = [
    "age", "weight", "bp_sys", "bp_dia", "serum_creatinine",
    "eGFR", "UACR", "hemoglobin", "sodium", "potassium"
]

CATEGORICAL_COLUMNS = [
    "sex", "diabetes", "hypertension", "smoking", "raas_blocker"
]

RANDOM_STATE = 42
TEST_SIZE = 0.2
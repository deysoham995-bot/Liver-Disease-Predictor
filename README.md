# AI Chronic Kidney Disease Progression Predictor

## Overview
This project predicts how Chronic Kidney Disease (CKD) may progress over time instead of only predicting whether CKD is present.

The model classifies patients into:
- Stable
- Slow Progression
- Rapid Progression

It uses longitudinal patient records such as:
- eGFR
- UACR / albuminuria
- blood pressure
- serum creatinine
- diabetes history
- hypertension history
- hemoglobin
- smoking
- medication use

## Why this project is important
Most beginner healthcare ML projects only predict disease presence.
This project predicts future worsening pattern, which is more meaningful for patient monitoring.

## Project modules
1. Data Loading
2. Label Creation
3. Feature Engineering
4. Preprocessing
5. Model Training
6. Evaluation
7. Prediction Dashboard

## Folder Structure
```text
ckd_progression_predictor/
├── app/
├── data/
├── models/
├── notebooks/
├── reports/
├── src/
├── requirements.txt
├── README.md
└── main.py
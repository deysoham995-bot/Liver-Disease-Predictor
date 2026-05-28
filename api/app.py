from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from src.predict import predict_single_patient

app = FastAPI(title="CKD Progression Predictor API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientInput(BaseModel):
    name: str = ""
    age: int = Field(..., ge=1, le=120)
    sex: str
    weight: float = Field(..., gt=0)
    diabetes: str
    hypertension: str
    smoking: str
    raasBlocker: str
    egfrFirst: float = Field(..., ge=0)
    egfrLast: float = Field(..., ge=0)
    uacrFirst: float = Field(..., ge=0)
    uacrLast: float = Field(..., ge=0)
    bpSys: float = Field(..., gt=0)
    bpDia: float = Field(..., gt=0)
    creatinine: float = Field(..., ge=0)
    hemoglobin: float = Field(..., ge=0)
    sodium: float = Field(..., ge=0)
    potassium: float = Field(..., ge=0)
    followupMonths: float = Field(..., gt=0)
    visitCount: int = Field(..., ge=1)


@app.get("/")
def home():
    return {"message": "CKD Predictor API running"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict(data: PatientInput):
    try:
        label, probs = predict_single_patient(data.model_dump())
        return {
            "prediction": label,
            "probabilities": probs
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Prediction failed inside backend.")
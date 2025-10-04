from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class PredictionRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    targetDate: str  # "YYYY-MM-DD"
    
    @field_validator("targetDate")
    @classmethod
    def validate_date(cls, v: str) -> str:
        # Solo valida formato básico; el front ya asegura "futura"
        import datetime as dt
        try:
            dt.date.fromisoformat(v)
        except Exception:
            raise ValueError("targetDate debe tener formato YYYY-MM-DD")
        return v

class HistoricalRow(BaseModel):
    year: int
    temperatureC: float
    humidity: float
    windSpeed: float
    conditions: str

class LocationOut(BaseModel):
    latitude: float
    longitude: float
    name: Optional[str] = None

class PredictionOut(BaseModel):
    temperatureC: float
    temperatureMin: float
    temperatureMax: float
    humidity: float
    humidityMin: float
    humidityMax: float
    windSpeed: float
    windSpeedMin: float
    windSpeedMax: float
    windDirection: str
    conditions: str
    precipitation: str
    visibility: str
    confidence: float  # 0-100

class AnalysisOut(BaseModel):
    yearsAnalyzed: int
    dataPoints: int
    trends: str
    notes: str

class PredictionResponse(BaseModel):
    targetDate: str
    location: LocationOut
    prediction: PredictionOut
    historicalData: List[HistoricalRow]
    analysis: AnalysisOut

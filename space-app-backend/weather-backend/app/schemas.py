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
    date: str  # "YYYY-MM-DD"
    temperatureC: float
    temperatureMax: Optional[float] = None  # Temperatura máxima del día
    temperatureMin: Optional[float] = None  # Temperatura mínima del día
    temperatureAvg: Optional[float] = None  # Temperatura promedio del día
    hourMax: Optional[int] = None  # Hora de temperatura máxima (0-23)
    hourMin: Optional[int] = None  # Hora de temperatura mínima (0-23)
    humidity: float
    windSpeed: float
    windDirection: float
    precipitation: float
    cloudCover: float
    pressure: float
    dewPoint: float
    uvIndex: float
    feelsLike: float

class StatisticsOut(BaseModel):
    temperature: dict
    humidity: dict
    windSpeed: dict
    precipitation: dict

class LocationOut(BaseModel):
    latitude: float
    longitude: float
    name: Optional[str] = None

class PredictionOut(BaseModel):
    """Datos de la predicción generada"""
    temperatureC: float
    humidity: float
    windSpeed: float
    windDirection: float
    windCompass: str
    precipitation: float
    heatIndex: float
    conditions: str
    # Nuevas variables climáticas
    weatherType: str  # "sunny", "rainy", "snowy", "cloudy", "stormy", "foggy"
    cloudCover: float  # Porcentaje de cobertura de nubes (0-100)
    uvIndex: float  # Índice UV (0-11+)
    dewPoint: float  # Punto de rocío en °C
    pressure: float  # Presión atmosférica en hPa
    feelsLike: float  # Sensación térmica en °C
    rainProbability: float  # Probabilidad de lluvia (0-100)
    snowProbability: float  # Probabilidad de nieve (0-100)

class PredictionResponse(BaseModel):
    prediction: PredictionOut
    confidence: float
    historicalData: List[HistoricalRow]
    statistics: StatisticsOut

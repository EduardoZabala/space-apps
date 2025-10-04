"""
FastAPI Backend para predicción meteorológica basada en datos históricos.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from .schemas import (
    PredictionRequest,
    PredictionResponse,
    LocationOut,
    PredictionOut,
    AnalysisOut,
    HistoricalRow
)
from .predictor import predict_for_point
from .providers.mock_provider import MockProvider
# from .providers.opendap_provider import OpendapProvider

load_dotenv()

ALLOWED = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
PROVIDER = os.getenv("DATA_PROVIDER", "mock").lower()

app = FastAPI(
    title="Weather Prediction API",
    description="API de predicción meteorológica basada en análisis de datos históricos",
    version="1.0.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Selección de proveedor de datos
if PROVIDER == "mock":
    data_provider = MockProvider()
else:
    # TODO: Implementar OpendapProvider cuando esté listo
    # earthdata_user = os.getenv("EARTHDATA_USERNAME")
    # earthdata_pass = os.getenv("EARTHDATA_PASSWORD")
    # data_provider = OpendapProvider(earthdata_user, earthdata_pass)
    raise ValueError(f"Proveedor '{PROVIDER}' no soportado. Use 'mock'.")


@app.get("/")
async def root():
    """Endpoint raíz con información de la API"""
    return {
        "name": "Weather Prediction API",
        "version": "1.0.0",
        "status": "running",
        "provider": PROVIDER,
        "endpoints": {
            "predict": "/api/weather/predict (POST)",
            "health": "/health (GET)"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "provider": PROVIDER
    }


@app.post("/api/weather/predict", response_model=PredictionResponse)
async def predict_weather(request: PredictionRequest):
    """
    Genera predicción meteorológica para una ubicación y fecha específicas.
    
    - **latitude**: Latitud (-90 a 90)
    - **longitude**: Longitud (-180 a 180)
    - **targetDate**: Fecha objetivo en formato YYYY-MM-DD
    
    Retorna predicción basada en análisis de datos históricos.
    """
    try:
        # Llamar al predictor
        prediction_data, historical_rows, trend_text, notes, years_analyzed, data_points = predict_for_point(
            provider=data_provider,
            lat=request.latitude,
            lon=request.longitude,
            target_date_str=request.targetDate
        )
        
        # Construir respuesta
        response = PredictionResponse(
            targetDate=request.targetDate,
            location=LocationOut(
                latitude=request.latitude,
                longitude=request.longitude,
                name=f"Lat: {request.latitude:.2f}, Lon: {request.longitude:.2f}"
            ),
            prediction=PredictionOut(**prediction_data),
            historicalData=[HistoricalRow(**row) for row in historical_rows],
            analysis=AnalysisOut(
                yearsAnalyzed=years_analyzed,
                dataPoints=data_points,
                trends=trend_text,
                notes=notes
            )
        )
        
        return response
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al generar predicción: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

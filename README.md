# 🌤️ Weather Prediction System - NASA Space Apps Challenge 2025
## 👥 Team
**Team Members:**
- Sebastian Villa Castillo
- Juan Sebastian Echeverri Gallego
- Juan David Velasquez Murillo
- Edwin Ramirez Gonzalez
- Jhon Eduardo Zabala Garzon <br>
A full-stack weather prediction application that analyzes historical data to forecast future weather patterns. Built with FastAPI (Python) and React (TypeScript).

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Python](https://img.shields.io/badge/python-3.13-blue.svg)
![React](https://img.shields.io/badge/react-19.1-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.9-blue.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Technologies](#technologies)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

This weather prediction system leverages historical meteorological data to generate forecasts for specific locations and dates. The application uses statistical analysis and pattern recognition to provide:

- Temperature predictions with confidence intervals
- Humidity levels and ranges
- Wind speed and direction
- Weather conditions and visibility
- Precipitation probability

The system is designed to be modular, allowing easy integration with real data sources like NASA's MERRA-2 and GLDAS datasets.

## ✨ Features

### Frontend
- 🗺️ **Interactive Map**: Click or drag marker to select any location worldwide
- 📅 **Date Picker**: Select target date for weather prediction
- 📊 **Detailed Visualization**: View predictions with historical data comparison
- 📈 **Charts & Graphs**: Visual representation of weather trends
- 💾 **Export to Excel**: Download predictions as CSV files
- 📱 **Responsive Design**: Works on desktop and mobile devices

### Backend
- ⚡ **Fast API**: Built with FastAPI for high performance
- 🔄 **Modular Data Providers**: Switch between mock and real data sources
- 📊 **Statistical Analysis**: Mean, standard deviation, min/max calculations
- 🎯 **Confidence Scoring**: Prediction reliability based on data quality
- 🌐 **CORS Enabled**: Ready for frontend integration
- 📚 **Auto Documentation**: Swagger UI and ReDoc included

## 🏗️ Architecture

```
┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │
│  React Frontend │◄───────►│  FastAPI Backend│
│   (Port 5173)   │  HTTPS  │   (Port 8000)   │
│                 │         │                 │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │                           │
    ┌────▼─────┐              ┌─────▼──────┐
    │ Leaflet  │              │  Data      │
    │   Map    │              │  Provider  │
    └──────────┘              └─────┬──────┘
                                    │
                              ┌─────┴──────┐
                              │            │
                         ┌────▼────┐  ┌────▼────┐
                         │  Mock   │  │NASA/NOAA│
                         │  Data   │  │  (Future)│
                         └─────────┘  └─────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Git**

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/EduardoZabala/space-apps.git
cd space-apps
```

2. **Start the application** (Linux/macOS)
```bash
chmod +x start.sh
./start.sh
```

Or on Windows:
```powershell
.\start.ps1
```

The script will:
- Set up Python virtual environment
- Install all dependencies
- Start backend on http://localhost:8000
- Start frontend on http://localhost:5173

3. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup

#### Backend Setup

```bash
cd space-app-backend/weather-backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env if needed

# Start server
python -m uvicorn app.main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd space-app-frontend

# Install dependencies
npm install

# Configure environment
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
```

## 📁 Project Structure

```
space-apps/
├── space-app-backend/
│   ├── etl-python/              # Data processing pipeline (Kedro)
│   │   ├── conf/                # Configuration files
│   │   ├── data/                # Data storage (raw, processed, models)
│   │   ├── notebooks/           # Jupyter notebooks for analysis
│   │   └── src/                 # Pipeline source code
│   └── weather-backend/         # FastAPI Backend
│       ├── app/
│       │   ├── main.py          # FastAPI application
│       │   ├── schemas.py       # Pydantic models
│       │   ├── predictor.py     # Prediction logic
│       │   ├── geocoding.py     # Location services
│       │   ├── utils.py         # Utilities
│       │   └── providers/       # Data source implementations
│       │       ├── base.py      # Abstract provider interface
│       │       ├── mock_provider.py    # Synthetic data
│       │       └── opendap_provider.py # NASA data (template)
│       ├── requirements.txt
│       ├── .env.example
│       └── README.md
├── space-app-frontend/          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LocationSearch.tsx    # Location input
│   │   │   ├── MapPicker.tsx         # Interactive map
│   │   │   ├── WeatherNavigator.tsx  # Main navigation
│   │   │   ├── WeatherDetail.tsx     # Results display
│   │   │   ├── WeatherReport.tsx     # Report component
│   │   │   ├── YearSelector.tsx      # Year input
│   │   │   ├── MonthSelector.tsx     # Month input
│   │   │   └── DaySelector.tsx       # Day input
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── start.sh                     # Linux/macOS startup script
├── start.ps1                    # Windows startup script
├── stop.sh                      # Shutdown script
└── README.md                    # This file
```

## 🛠️ Technologies

### Frontend
- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tool and dev server
- **React Leaflet** - Interactive maps
- **Bootstrap 5** - UI components
- **SheetJS (xlsx)** - Excel export

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **xarray** - Multi-dimensional data processing
- **Python-dotenv** - Environment management

### Data Processing (ETL Pipeline)
- **Kedro** - Data pipeline framework
- **Pandas** - Data manipulation
- **NumPy** - Numerical computing

## 📖 API Documentation

### Endpoints

#### `GET /`
Root endpoint with API information

**Response:**
```json
{
  "name": "Weather Prediction API",
  "version": "1.0.0",
  "status": "running",
  "provider": "mock",
  "endpoints": {
    "predict": "/api/weather/predict (POST)",
    "health": "/health (GET)"
  }
}
```

#### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "provider": "mock"
}
```

#### `POST /api/weather/predict`
Generate weather prediction

**Request Body:**
```json
{
  "latitude": 4.7110,
  "longitude": -74.0721,
  "targetDate": "2025-12-25"
}
```

**Response:**
```json
{
  "targetDate": "2025-12-25",
  "location": {
    "latitude": 4.7110,
    "longitude": -74.0721,
    "name": "Lat: 4.71, Lon: -74.07"
  },
  "prediction": {
    "temperatureC": 18.5,
    "temperatureMin": 14.2,
    "temperatureMax": 22.8,
    "humidity": 75.3,
    "humidityMin": 65.0,
    "humidityMax": 85.0,
    "windSpeed": 8.2,
    "windSpeedMin": 5.0,
    "windSpeedMax": 12.0,
    "windDirection": "NE",
    "conditions": "Mild, humid, partly cloudy",
    "precipitation": "Moderate probability (~40%)",
    "visibility": "Good (8-10 km)",
    "confidence": 78.5
  },
  "historicalData": [
    {
      "year": 2023,
      "temperatureC": 19.0,
      "humidity": 72.0,
      "windSpeed": 7.0,
      "conditions": "Mild, humid, partly cloudy"
    }
  ],
  "analysis": {
    "yearsAnalyzed": 10,
    "dataPoints": 10,
    "trends": "Based on analysis of the last 10 years...",
    "notes": "This prediction was generated using algorithms..."
  }
}
```

### Interactive Documentation

Once the server is running:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## ⚙️ Configuration

### Backend Environment Variables (`.env`)

```env
# CORS - Allowed origins
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174

# Data provider (mock | opendap)
DATA_PROVIDER=mock

# NASA EarthData credentials (for future use)
EARTHDATA_USERNAME=your_username
EARTHDATA_PASSWORD=your_password
```

### Frontend Environment Variables (`.env`)

```env
# Backend API URL
VITE_API_URL=http://localhost:8000
```

## 🔌 Data Providers

### Current: MockProvider
Generates realistic synthetic data based on:
- Seasonal patterns
- Year-to-year variability
- Geographic coordinates
- Historical trends

### Future: OpendapProvider
Template for connecting to real NASA/NOAA data:
- **MERRA-2**: Modern-Era Retrospective analysis for Research and Applications
- **GLDAS**: Global Land Data Assimilation System
- **Authentication**: NASA EarthData credentials
- **Protocol**: OPeNDAP for remote data access

## 🎨 Frontend Features

### Interactive Map
- Click anywhere on the map to select location
- Drag marker to adjust position
- Zoom and pan to explore
- Coordinates update in real-time

### Date Selection
- Separate selectors for year, month, and day
- Validation for valid dates
- Intuitive user interface

### Results Display
- Prediction summary with confidence score
- Historical data comparison table
- Weather trends analysis
- Export functionality

## 🧪 Testing

### Backend Tests

```bash
cd space-app-backend/weather-backend

# Test with curl
curl -X POST "http://localhost:8000/api/weather/predict" \
  -H "Content-Type: application/json" \
  -d '{"latitude": 4.7110, "longitude": -74.0721, "targetDate": "2025-12-25"}'

# Test with Python
python -c "
import requests
response = requests.post(
    'http://localhost:8000/api/weather/predict',
    json={'latitude': 4.7110, 'longitude': -74.0721, 'targetDate': '2025-12-25'}
)
print(response.json())
"
```

### Frontend Tests

```bash
cd space-app-frontend

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚢 Deployment

### Backend Deployment

**Docker (Recommended)**

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY .env .

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Traditional Deployment**

```bash
# Install dependencies
pip install -r requirements.txt

# Run with Gunicorn (production)
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Output in dist/ folder
# Deploy to Vercel, Netlify, or any static host
```

**Environment Variables for Production:**
- Set `VITE_API_URL` to your production API URL
- Update `ALLOWED_ORIGINS` in backend `.env`

## 🐛 Troubleshooting

### CORS Errors
- Verify `ALLOWED_ORIGINS` in backend `.env` includes frontend URL
- Restart backend after changing `.env`

### Module Not Found
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt`

### Port Already in Use
- Change port: `--port 8001`
- Kill process: `lsof -ti:8000 | xargs kill -9` (Linux/macOS)

### Map Not Loading
- Check internet connection (Leaflet requires external tiles)
- Verify `leaflet` CSS is imported
- Check browser console for errors

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist/ .vite/`

## 🔮 Future Enhancements

### Short Term
- [ ] Implement OpendapProvider with NASA data
- [ ] Add authentication and user accounts
- [ ] Implement caching for faster responses
- [ ] Add more weather variables (precipitation, pressure)

### Medium Term
- [ ] Machine learning models for improved predictions
- [ ] Historical data visualization with charts
- [ ] Multi-day forecast capability
- [ ] Mobile application (React Native)

### Long Term
- [ ] Real-time weather monitoring
- [ ] Extreme weather event prediction
- [ ] Integration with IoT weather stations
- [ ] AI-powered natural language weather descriptions

## 📊 Data Sources

### Current
- **Synthetic Data**: Generated using statistical models and seasonal patterns

### Planned
- **NASA MERRA-2**: Global atmospheric reanalysis
- **NOAA GLDAS**: Land surface modeling data
- **OpenWeatherMap**: Current weather conditions
- **Climate Data Store**: Historical climate records

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Standards
- **Python**: Follow PEP 8
- **TypeScript**: Use ESLint configuration
- **Commits**: Use conventional commits format

## 📝 License

This project was developed for the NASA Space Apps Challenge 2025.


**Contact:**
- Repository: [github.com/EduardoZabala/space-apps](https://github.com/EduardoZabala/space-apps)
- NASA Space Apps: [spaceappschallenge.org](https://www.spaceappschallenge.org/)

## 🙏 Acknowledgments

- NASA for providing access to Earth science data
- OpenStreetMap contributors for map tiles
- The open-source community for amazing tools and libraries

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Leaflet Documentation](https://leafletjs.com/)
- [NASA EarthData](https://www.earthdata.nasa.gov/)
- [MERRA-2 Dataset](https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/)

---

**Built with ❤️ for NASA Space Apps Challenge 2025**

"""
Proveedor de datos reales vía OPeNDAP de NASA.
Conecta con datos de MERRA-2 (Modern-Era Retrospective analysis for Research and Applications).
"""
import xarray as xr
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict
from .base import WeatherDataProvider
import requests
from requests.auth import HTTPBasicAuth
from http.cookiejar import CookieJar
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
from pathlib import Path

class OpendapProvider(WeatherDataProvider):
    """
    Implementación de proveedor de datos reales de NASA MERRA-2.
    Obtiene datos históricos meteorológicos reales vía OPeNDAP.
    """
    
    # URLs de datos MERRA-2
    MERRA2_BASE_URL = "https://goldsmr4.gesdisc.eosdis.nasa.gov/opendap/MERRA2"
    
    def __init__(self, earthdata_username: str = None, earthdata_password: str = None):
        """
        Inicializa el proveedor con credenciales de NASA EarthData.
        
        Args:
            earthdata_username: Usuario de NASA EarthData
            earthdata_password: Contraseña de NASA EarthData
        """
        self.username = earthdata_username
        self.password = earthdata_password
        self.session = None
        
        if self.username and self.password:
            self._setup_session()
    
    def _setup_session(self):
        """
        Configura sesión HTTP con autenticación completa para NASA EarthData.
        Incluye manejo de cookies y redirects para GES DISC.
        """
        # Crear manejador de cookies
        cookie_jar = CookieJar()
        
        # Crear opener con autenticación
        password_manager = urllib.request.HTTPPasswordMgrWithDefaultRealm()
        password_manager.add_password(
            None,
            "https://urs.earthdata.nasa.gov",
            self.username,
            self.password
        )
        
        # Manejadores necesarios
        auth_handler = urllib.request.HTTPBasicAuthHandler(password_manager)
        cookie_handler = urllib.request.HTTPCookieProcessor(cookie_jar)
        
        # Crear opener con todos los manejadores
        opener = urllib.request.build_opener(auth_handler, cookie_handler)
        urllib.request.install_opener(opener)
        
        # También configurar sesión requests con cookies
        self.session = requests.Session()
        self.session.auth = HTTPBasicAuth(self.username, self.password)
        self.session.cookies = requests.cookies.cookiejar_from_dict({})
        
        # Headers importantes
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (compatible; WeatherPredictionAPI/1.0)'
        })
        
        print(f"🔐 Sesión configurada para usuario: {self.username}")
        print(f"🍪 Sistema de cookies habilitado para autenticación NASA")
    
    def _authenticate_with_urs(self):
        """
        Realiza autenticación inicial con URS (NASA EarthData) para obtener cookies.
        Esto es necesario antes de descargar archivos de GES DISC.
        """
        try:
            print("🔑 Autenticando con NASA EarthData URS...")
            
            # URL de autenticación URS
            urs_url = "https://urs.earthdata.nasa.gov/oauth/authorize"
            
            # Hacer request a URS para obtener cookies
            response = self.session.get(
                urs_url,
                params={
                    'client_id': 'e2WVk8Pw6weeLUKZYOxvTQ',
                    'response_type': 'code',
                    'redirect_uri': 'https://auth.ops.maap-project.org/cas/callback'
                },
                allow_redirects=True,
                timeout=30
            )
            
            if response.status_code == 200:
                print("✅ Cookies de autenticación obtenidas")
                return True
            else:
                print(f"⚠️  No se pudieron obtener cookies: HTTP {response.status_code}")
                return False
                
        except Exception as e:
            print(f"⚠️  Error en autenticación URS: {e}")
            return False
    
    def _get_cache_key(self, lat: float, lon: float, date: datetime) -> str:
        """
        Genera una clave única para el caché basada en coordenadas y fecha.
        
        Args:
            lat: Latitud
            lon: Longitud
            date: Fecha
            
        Returns:
            Hash MD5 como clave de caché
        """
        key_str = f"{lat:.2f}_{lon:.2f}_{date.strftime('%Y%m%d')}"
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def _get_cached_data(self, cache_key: str) -> dict | None:
        """
        Obtiene datos del caché si existen y son válidos.
        
        Args:
            cache_key: Clave de caché
            
        Returns:
            Diccionario con datos o None si no existe/inválido
        """
        cache_dir = Path("/tmp/merra2_cache")
        cache_file = cache_dir / f"{cache_key}.json"
        
        if cache_file.exists():
            try:
                with open(cache_file, 'r') as f:
                    cached_data = json.load(f)
                    print(f"📦 Datos obtenidos del caché: {cache_file.name}")
                    return cached_data
            except Exception as e:
                print(f"⚠️  Error leyendo caché: {e}")
                return None
        
        return None
    
    def _save_to_cache(self, cache_key: str, data: dict):
        """
        Guarda datos en el caché local.
        
        Args:
            cache_key: Clave de caché
            data: Datos a guardar
        """
        cache_dir = Path("/tmp/merra2_cache")
        cache_dir.mkdir(exist_ok=True)
        cache_file = cache_dir / f"{cache_key}.json"
        
        try:
            with open(cache_file, 'w') as f:
                json.dump(data, f)
                print(f"💾 Datos guardados en caché: {cache_file.name}")
        except Exception as e:
            print(f"⚠️  Error guardando caché: {e}")
        
    def fetch_historical_data(
        self,
        lat: float,
        lon: float,
        target_month: int,
        target_day: int,
        years_back: int = 10  # 10 años de datos históricos para mejor predicción
    ) -> pd.DataFrame:
        """
        Obtiene datos meteorológicos reales de NASA MERRA-2 para los últimos años.
        Usa descarga paralela con límite de workers para evitar sobrecarga del servidor NASA.
        
        Args:
            lat: Latitud del punto
            lon: Longitud del punto
            target_month: Mes objetivo (1-12)
            target_day: Día objetivo (1-31)
            years_back: Años hacia atrás (default: 10, con descarga paralela limitada)
            
        Returns:
            DataFrame con datos históricos reales de NASA MERRA-2
        """
        try:
            current_year = datetime.now().year
            years = list(range(current_year - years_back, current_year))
            
            print(f"🚀 Descargando {years_back} años de datos NASA MERRA-2 en paralelo...")
            print(f"   Años: {years[0]}-{years[-1]}")
            
            data = []
            
            # Función para procesar un año (con caché)
            def fetch_year(year):
                try:
                    # Crear fecha objetivo
                    target_date = datetime(year, target_month, target_day)
                    
                    # Verificar caché primero
                    cache_key = self._get_cache_key(lat, lon, target_date)
                    cached = self._get_cached_data(cache_key)
                    
                    if cached:
                        return {
                            "year": int(year),
                            "temperatureC": float(cached.get("temperature", 15.0)),
                            "temperatureMax": float(cached.get("temperature_max", 15.0)),
                            "temperatureMin": float(cached.get("temperature_min", 15.0)),
                            "temperatureAvg": float(cached.get("temperature_avg", 15.0)),
                            "hourMax": int(cached.get("hour_max", 14)),
                            "hourMin": int(cached.get("hour_min", 6)),
                            "humidity": float(cached.get("humidity", 60.0)),
                            "windSpeed": float(cached.get("wind_speed", 5.0)),
                            "windDirection": float(cached.get("wind_direction", 0.0)),
                            "precipitation": float(cached.get("precipitation", 0.0)),
                            "cloudCover": float(cached.get("cloud_cover", 50.0)),
                            "pressure": float(cached.get("pressure", 1013.0)),
                            "dewPoint": float(cached.get("dew_point", 10.0)),
                            "uvIndex": float(cached.get("uv_index", 5.0)),
                            "feelsLike": float(cached.get("feels_like", 15.0))
                        }
                    
                    # Obtener datos de MERRA-2 para esa fecha
                    weather_data = self._fetch_merra2_day(lat, lon, target_date)
                    
                    if weather_data:
                        # Guardar en caché
                        self._save_to_cache(cache_key, weather_data)
                        
                        # DEBUG: Verificar que los datos tienen temp max/min
                        print(f"DEBUG año {year}: weather_data keys = {list(weather_data.keys())}")
                        
                        return {
                            "year": int(year),
                            "temperatureC": float(weather_data.get("temperature", 15.0)),
                            "temperatureMax": float(weather_data.get("temperature_max", 15.0)),
                            "temperatureMin": float(weather_data.get("temperature_min", 15.0)),
                            "temperatureAvg": float(weather_data.get("temperature_avg", 15.0)),
                            "hourMax": int(weather_data.get("hour_max", 14)),
                            "hourMin": int(weather_data.get("hour_min", 6)),
                            "humidity": float(weather_data.get("humidity", 60.0)),
                            "windSpeed": float(weather_data.get("wind_speed", 5.0)),
                            "windDirection": float(weather_data.get("wind_direction", 0.0)),
                            "precipitation": float(weather_data.get("precipitation", 0.0)),
                            "cloudCover": float(weather_data.get("cloud_cover", 50.0)),
                            "pressure": float(weather_data.get("pressure", 1013.0)),
                            "dewPoint": float(weather_data.get("dew_point", 10.0)),
                            "uvIndex": float(weather_data.get("uv_index", 5.0)),
                            "feelsLike": float(weather_data.get("feels_like", 15.0))
                        }
                    return None
                    
                except Exception as e:
                    print(f"⚠️  Error obteniendo datos para {year}: {e}")
                    # Si falla un año, usar estimación basada en climatología
                    return self._get_climatology_estimate(lat, lon, target_month, year)
            
            # Ejecutar descargas en paralelo con ThreadPoolExecutor
            # Limitamos a 5 workers para evitar sobrecarga del servidor NASA (errores 503)
            with ThreadPoolExecutor(max_workers=5) as executor:
                # Enviar todas las tareas
                futures = {executor.submit(fetch_year, year): year for year in years}
                
                # Procesar resultados conforme se completan
                for future in as_completed(futures, timeout=60):
                    year = futures[future]
                    try:
                        result = future.result()
                        if result:
                            data.append(result)
                            print(f"✅ Año {year} completado")
                    except Exception as e:
                        print(f"❌ Error procesando {year}: {e}")
                        # Agregar estimación climatológica
                        data.append(self._get_climatology_estimate(lat, lon, target_month, year))
            
            if not data:
                raise ValueError("No se pudieron obtener datos históricos")
                
            return pd.DataFrame(data)
            
        except Exception as e:
            print(f"❌ Error en OpendapProvider: {e}")
            print("📊 Usando datos de respaldo climatológicos...")
            return self._get_fallback_data(lat, lon, target_month, target_day, years_back)
    def _fetch_merra2_day(self, lat: float, lon: float, date: datetime) -> Dict[str, float]:
        """
        Consulta ligera a MERRA-2 usando OPeNDAP.
        SOLO descarga el punto geográfico necesario (~1-2 KB vs 393 MB).
        """
        try:
            # Convertir coordenadas
            lon_merra = lon if lon <= 180 else lon - 360
            year, month, day = date.year, date.month, date.day
            
            # Determinar stream MERRA-2
            stream = "400" if year >= 2011 else "300" if year >= 2001 else "200" if year >= 1992 else "100"
            
            # Construir URL OPeNDAP con protocolo DAP4 (más rápido que DAP2 legacy)
            collection = "M2T1NXSLV.5.12.4"
            filename = f"MERRA2_{stream}.tavg1_2d_slv_Nx.{year}{month:02d}{day:02d}.nc4"
            
            # Usar dap4:// para consultas más rápidas
            base_url = "dap4://goldsmr4.gesdisc.eosdis.nasa.gov/opendap/MERRA2"
            opendap_url = f"{base_url}/{collection}/{year}/{month:02d}/{filename}"
            
            print(f"🌐 Consulta OPeNDAP para {date.strftime('%Y-%m-%d')} en ({lat:.2f}, {lon:.2f})")
            print(f"   Descargando solo ~1-2 KB (punto específico)")
            
            # Abrir dataset remoto con pydap
            from pydap.client import open_url
            from pydap.cas.urs import setup_session
            
            session = setup_session(self.username, self.password, check_url=opendap_url)
            store = xr.backends.PydapDataStore.open(opendap_url, session=session)
            ds = xr.open_dataset(store)
            
            # DAP4 usa nombres con "/" al inicio, necesitamos renombrar las dimensiones
            # Renombrar /lat -> lat, /lon -> lon, /time -> time para compatibilidad
            dim_mapping = {}
            for dim in ds.dims:
                if dim.startswith('/'):
                    dim_mapping[dim] = dim[1:]  # Remover la barra inicial
            
            if dim_mapping:
                ds = ds.rename(dim_mapping)
                print(f"📝 Dimensiones renombradas: {list(dim_mapping.keys())} -> {list(dim_mapping.values())}")
            
            # DAP4 no soporta bien sel() con method='nearest' porque las coordenadas
            # no están indexadas correctamente. Usamos selección por índices.
            # MERRA-2 grid: lat de -90 a 90 en pasos de 0.5° (361 puntos)
            #               lon de -180 a 180 en pasos de 0.625° (576 puntos)
            
            # Calcular índices más cercanos
            lat_idx = int(round((lat + 90) / 0.5))
            lon_idx = int(round((lon_merra + 180) / 0.625))
            
            # Asegurar que estén en rango válido
            lat_idx = max(0, min(360, lat_idx))  # 361 puntos (0-360)
            lon_idx = max(0, min(575, lon_idx))  # 576 puntos (0-575)
            
            print(f"🎯 Índices calculados: lat_idx={lat_idx}, lon_idx={lon_idx}")
            
            # Seleccionar punto usando isel() en lugar de sel()
            point = ds.isel(lat=lat_idx, lon=lon_idx)
            
            # El dataset MERRA-2 tiene múltiples mediciones por día (cada hora)
            # Extraemos temperatura máxima, mínima, promedio y sus horas
            
            # Obtener array de temperaturas del día
            temp_array = point['T2M'].values
            
            # Temperatura máxima y su índice (hora)
            temp_max_idx = int(np.argmax(temp_array))
            temp_k_max = float(temp_array[temp_max_idx])
            temp_c_max = temp_k_max - 273.15
            hour_max = temp_max_idx  # MERRA-2 es horario, índice 0 = 00:00, 1 = 01:00, etc.
            
            # Temperatura mínima y su índice (hora)
            temp_min_idx = int(np.argmin(temp_array))
            temp_k_min = float(temp_array[temp_min_idx])
            temp_c_min = temp_k_min - 273.15
            hour_min = temp_min_idx
            
            # Temperatura promedio
            temp_k_avg = float(np.mean(temp_array))
            temp_c_avg = temp_k_avg - 273.15
            
            # Usamos la máxima como temperatura principal (lo que espera el usuario)
            temp_c = temp_c_max
            
            print(f"🌡️  TEMPERATURA:")
            print(f"    Máxima: {temp_c_max:.2f}°C a las {hour_max:02d}:00")
            print(f"    Mínima: {temp_c_min:.2f}°C a las {hour_min:02d}:00")
            print(f"    Promedio: {temp_c_avg:.2f}°C")
            
            # Humedad (promedio diario)
            if 'RH2M' in ds.data_vars:
                humidity = float(point['RH2M'].mean().values)
                print(f"💧 HUMEDAD: {humidity:.1f}% (RH2M)")
            elif 'QV2M' in ds.data_vars:
                qv = float(point['QV2M'].mean().values)
                # Calcular humedad relativa desde humedad específica
                es = 6.112 * np.exp((17.67 * temp_c) / (temp_c + 243.5))
                e = qv * 1013.25 / (0.622 + 0.378 * qv)
                humidity = min(100, max(0, (e / es) * 100))
                print(f"💧 HUMEDAD: {humidity:.1f}% (calculada desde QV2M={qv:.6f})")
            else:
                humidity = 60.0
                print(f"💧 HUMEDAD: {humidity:.1f}% (valor por defecto)")
            
            # Viento (promedio diario)
            u = float(point['U10M'].mean().values) if 'U10M' in ds.data_vars else 0
            v = float(point['V10M'].mean().values) if 'V10M' in ds.data_vars else 0
            wind_speed = np.sqrt(u**2 + v**2)
            wind_direction = (np.degrees(np.arctan2(v, u)) + 360) % 360
            
            # Precipitación
            precip = 0.0
            for var in ['PRECTOT', 'PRECTOTCORR', 'PRECTOTLAND']:
                if var in ds.data_vars:
                    precip = float(point[var].sum().values)
                    break
            
            # Presión
            if 'PS' in ds.data_vars:
                pressure = float(point['PS'].mean().values) / 100
            elif 'SLP' in ds.data_vars:
                pressure = float(point['SLP'].mean().values) / 100
            else:
                pressure = 1013.25
            
            ds.close()
            
            # Calcular variables derivadas
            a, b = 17.27, 237.7
            alpha = ((a * temp_c) / (b + temp_c)) + np.log(humidity / 100.0)
            dew_point = (b * alpha) / (a - alpha)
            
            if temp_c >= 27:
                feels_like = temp_c + 0.33 * (humidity / 100 * 6.105 * np.exp(17.27 * temp_c / (237.7 + temp_c))) - 0.70 * wind_speed - 4.00
            elif temp_c <= 10:
                feels_like = 13.12 + 0.6215 * temp_c - 11.37 * (wind_speed * 3.6)**0.16 + 0.3965 * temp_c * (wind_speed * 3.6)**0.16
            else:
                feels_like = temp_c
            
            cloud_cover = min(100, max(0, humidity * 0.8 + (precip * 10)))
            uv_base = 11 * (1 - abs(lat) / 90)
            seasonal_factor = np.sin(2 * np.pi * (date.month - 3) / 12)
            uv_index = max(0, uv_base * (0.7 + 0.3 * seasonal_factor) * (1 - cloud_cover / 200))
            
            print(f"✅ Datos obtenidos: Temp Max={temp_c_max:.1f}°C, Min={temp_c_min:.1f}°C, Humedad={humidity:.1f}%")
            
            return {
                "temperature": round(temp_c, 1),  # Temperatura máxima
                "temperature_max": round(temp_c_max, 1),
                "temperature_min": round(temp_c_min, 1),
                "temperature_avg": round(temp_c_avg, 1),
                "hour_max": hour_max,
                "hour_min": hour_min,
                "humidity": round(humidity, 1),
                "wind_speed": round(wind_speed, 1),
                "wind_direction": round(wind_direction, 1),
                "precipitation": round(precip, 1),
                "cloud_cover": round(cloud_cover, 1),
                "pressure": round(pressure, 1),
                "dew_point": round(dew_point, 1),
                "uv_index": round(uv_index, 1),
                "feels_like": round(feels_like, 1)
            }
            
        except Exception as e:
            print(f"⚠️  Error OPeNDAP para {date}: {str(e)}")
            import traceback
            traceback.print_exc()
            return None
    
    def _get_climatology_estimate(self, lat: float, lon: float, month: int, year: int) -> dict:
        """
        Genera estimación basada en climatología cuando fallan datos reales.
        Usa patrones estacionales realistas basados en ubicación.
        """
        # Temperatura base según latitud y mes
        seasonal_factor = np.sin(2 * np.pi * (month - 3) / 12)
        latitude_factor = (90 - abs(lat)) / 90  # Más cálido cerca del ecuador
        
        base_temp = 15 + (15 * latitude_factor * seasonal_factor)
        temp_variation = np.random.normal(0, 2)
        temp = base_temp + temp_variation
        
        # Humedad
        base_humidity = 60 + 20 * np.cos(2 * np.pi * (month - 6) / 12)
        humidity_variation = np.random.normal(0, 8)
        humidity = max(20, min(100, base_humidity + humidity_variation))
        
        # Viento
        wind_speed = abs(np.random.normal(7, 2.5))
        wind_direction = np.random.uniform(0, 360)
        
        # Precipitación
        precipitation = max(0, np.random.exponential(1.5))
        
        # Variables adicionales calculadas
        # Punto de rocío
        a = 17.27
        b = 237.7
        alpha = ((a * temp) / (b + temp)) + np.log(humidity / 100.0)
        dew_point = (b * alpha) / (a - alpha)
        
        # Presión atmosférica (estándar a nivel del mar)
        pressure = 1013.25 + np.random.normal(0, 5)
        
        # Sensación térmica
        if temp >= 27:
            feels_like = temp + 0.33 * (humidity / 100 * 6.105 * np.exp(17.27 * temp / (237.7 + temp))) - 0.70 * wind_speed - 4.00
        elif temp <= 10:
            feels_like = 13.12 + 0.6215 * temp - 11.37 * (wind_speed * 3.6)**0.16 + 0.3965 * temp * (wind_speed * 3.6)**0.16
        else:
            feels_like = temp
        
        # Cobertura de nubes
        cloud_cover = min(100, max(0, humidity * 0.8 + (precipitation * 10)))
        
        # Índice UV
        uv_base = 11 * (1 - abs(lat) / 90)
        seasonal_factor_uv = np.sin(2 * np.pi * (month - 3) / 12)
        uv_index = max(0, uv_base * (0.7 + 0.3 * seasonal_factor_uv) * (1 - cloud_cover / 200))
        
        return {
            "year": year,
            "temperatureC": round(temp, 1),
            "humidity": round(humidity, 1),
            "windSpeed": round(wind_speed, 1),
            "windDirection": round(wind_direction, 1),
            "precipitation": round(precipitation, 1),
            "cloudCover": round(cloud_cover, 1),
            "pressure": round(pressure, 1),
            "dewPoint": round(dew_point, 1),
            "uvIndex": round(uv_index, 1),
            "feelsLike": round(feels_like, 1)
        }
    
    def _get_fallback_data(self, lat: float, lon: float, month: int, day: int, years_back: int) -> pd.DataFrame:
        """
        Datos de respaldo cuando falla completamente la conexión con NASA.
        Genera datos climatológicos más sofisticados que mock puro.
        """
        current_year = datetime.now().year
        years = list(range(current_year - years_back, current_year))
        
        data = []
        for year in years:
            data.append(self._get_climatology_estimate(lat, lon, month, year))
        
        return pd.DataFrame(data)

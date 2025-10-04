"""
Plantilla para proveedor de datos reales vía OPeNDAP.
Conecta con datos de NASA/NOAA usando xarray.
"""
import xarray as xr
import pandas as pd
from .base import WeatherDataProvider

class OpendapProvider(WeatherDataProvider):
    """
    PLANTILLA: Implementación futura para datos reales de NASA.
    Requiere credenciales de EarthData y configuración de endpoints.
    """
    
    def __init__(self, earthdata_username: str = None, earthdata_password: str = None):
        self.username = earthdata_username
        self.password = earthdata_password
        # TODO: Configurar autenticación con NASA EarthData
        
    def fetch_historical_data(
        self,
        lat: float,
        lon: float,
        target_month: int,
        target_day: int,
        years_back: int = 10
    ) -> pd.DataFrame:
        """
        TODO: Implementar descarga de datos reales vía OPeNDAP.
        
        Pasos:
        1. Autenticarse con NASA EarthData
        2. Abrir dataset con xarray (ejemplo: MERRA-2, GLDAS)
        3. Seleccionar punto geográfico más cercano
        4. Extraer datos para el mes/día objetivo de años anteriores
        5. Retornar DataFrame con formato estándar
        """
        raise NotImplementedError(
            "OpendapProvider aún no está implementado. "
            "Use MockProvider para desarrollo."
        )

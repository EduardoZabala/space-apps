import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix para los iconos de Leaflet en Vite/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
}

// Función para normalizar la longitud al rango -180 a 180
function normalizeLongitude(lng: number): number {
  while (lng > 180) lng -= 360;
  while (lng <= -180) lng += 360;
  return parseFloat(lng.toFixed(6));
}

// Función para asegurar que la latitud esté en el rango -90 a 90
function clampLatitude(lat: number): number {
  return parseFloat(Math.max(-90, Math.min(90, lat)).toFixed(6));
}

function LocationMarker({
  latitude,
  longitude,
  onLocationChange,
}: InteractiveMapProps) {
  const map = useMapEvents({
    click(e) {
      const rawLat = Number(e.latlng.lat);
      const rawLng = Number(e.latlng.lng);

      const clampedLat = clampLatitude(rawLat);
      const normalizedLng = normalizeLongitude(rawLng);

      onLocationChange(clampedLat, normalizedLng);
    },
  });

  useEffect(() => {
    if (latitude && longitude) {
      map.setView([latitude, longitude], map.getZoom());
    }
  }, [latitude, longitude, map]);

  const position =
    latitude && longitude
      ? ([latitude, longitude] as L.LatLngExpression)
      : null;

  return position ? <Marker position={position} /> : null;
}

export default function InteractiveMap({
  latitude,
  longitude,
  onLocationChange,
}: InteractiveMapProps) {
  const mapRef = useRef<L.Map>(null);
  const defaultLat = latitude || 20;
  const defaultLng = longitude || 0;
  const defaultZoom = 4;

  return (
    <div className="interactive-map-container">
      <div className="map-instructions">
        <i className="fas fa-mouse-pointer"></i>
        <span>Click on the map to select a location</span>
      </div>

      <div className="map-wrapper">
        <MapContainer
          ref={mapRef}
          center={[defaultLat, defaultLng]}
          zoom={defaultZoom}
          style={{ height: "400px", width: "100%", borderRadius: "8px" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            latitude={latitude}
            longitude={longitude}
            onLocationChange={onLocationChange}
          />
        </MapContainer>
      </div>

      {latitude && longitude ? (
        <div className="coordinates-display">
          <div className="coordinate-item">
            <strong>Latitude:</strong> {latitude.toFixed(6)}
          </div>
          <div className="coordinate-item">
            <strong>Longitud:</strong> {longitude.toFixed(6)}
          </div>
        </div>
      ) : (
        <div className="coordinates-placeholder">
          <strong>Select a location on the map</strong>
        </div>
      )}
    </div>
  );
}

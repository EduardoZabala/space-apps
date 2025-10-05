import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import type { LatLngLiteral, LeafletEventHandlerFnMap, Map as LeafletMap } from "leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Fix del ícono del marcador ---
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// --- Tipos y utilidades ---
type Position = LatLngLiteral | null;

const isValidLatLng = (pos: Position): pos is LatLngLiteral =>
  !!pos &&
  typeof pos.lat === "number" &&
  typeof pos.lng === "number" &&
  !Number.isNaN(pos.lat) &&
  !Number.isNaN(pos.lng);

// --- Sincroniza la vista del mapa con las props ---
function MapUpdater({ position }: { position: Position }) {
  const map = useMap();
  useEffect(() => {
    if (isValidLatLng(position)) {
      map.flyTo([position.lat, position.lng], map.getZoom(), { duration: 0.3 });
    }
  }, [position, map]);
  return null;
}

// --- Manejador de clics en el mapa ---
function MapClickHandler({ onClick }: { onClick: (pos: LatLngLiteral) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng);
    },
  });
  return null;
}

// --- Llama a whenReady cuando el mapa está listo ---
function MapReadyHandler({ onReady }: { onReady?: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    if (onReady) {
      onReady(map);
    }
  }, [map, onReady]);
  return null;
}

// --- Props del componente ---
export interface MapPickerProps {
  position: Position;
  onPositionChange?: (pos: LatLngLiteral) => void;
  initialZoom?: number;
  height?: number;
  rounded?: number;
  className?: string;
  whenReady?: (map: LeafletMap) => void;
}

// --- Componente principal MapPicker ---
const MapPicker: React.FC<MapPickerProps> = ({
  position,
  onPositionChange,
  initialZoom = 13,
  height = 400,
  rounded = 8,
  className,
  whenReady,
}) => {
  const hasValidPosition = isValidLatLng(position);

  const initialCenter = useMemo<[number, number]>(
    () => (hasValidPosition ? [position.lat, position.lng] : [6.24, -75.58]), // Centro por defecto (Medellín)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const markerPosition = useMemo<[number, number] | null>(
    () => (hasValidPosition ? [position.lat, position.lng] : null),
    [hasValidPosition, position?.lat, position?.lng]
  );

  const eventHandlers: LeafletEventHandlerFnMap = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target as L.Marker;
        onPositionChange?.(marker.getLatLng());
      },
    }),
    [onPositionChange]
  );

  return (
    <MapContainer
      center={initialCenter}
      zoom={hasValidPosition ? initialZoom : 7}
      className={className}
      style={{ height: `${height}px`, width: "100%", borderRadius: `${rounded}px` }}
      scrollWheelZoom
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {markerPosition && (
        <Marker draggable={true} eventHandlers={eventHandlers} position={markerPosition}>
          <Popup>Arrastra o haz clic en el mapa para mover.</Popup>
        </Marker>
      )}

      {/* Componentes funcionales internos */}
      <MapUpdater position={position} />
      <MapClickHandler onClick={(pos) => onPositionChange?.(pos)} />
      <MapReadyHandler onReady={whenReady} />
    </MapContainer>
  );
};

export default MapPicker;
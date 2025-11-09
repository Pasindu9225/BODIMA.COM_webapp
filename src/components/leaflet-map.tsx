"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, memo } from "react";
import type { Listing, University, MarkerData } from "@/lib/types";

// ✅ Fix for default icon not showing in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🎓 University marker icon (Lucide-style from CDN)
const universityIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/color/96/graduation-cap--v1.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

// 📍 Listing marker icon
const listingIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/office/80/marker.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

type LeafletMapProps = {
  center: [number, number];
  zoom: number;
  markers: MarkerData[];
  selectedListing: Listing | null;
  onMarkerClick: (item: Listing | University) => void;
  onPopupClose: () => void;
};

// 🔹 Updates map view dynamically
function ChangeView({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// 🔹 Handles popup close events
const MapEvents = ({ onPopupClose }: { onPopupClose: () => void }) => {
  useMapEvents({
    popupclose: onPopupClose,
  });
  return null;
};

// 🔹 Main Map Component
const LeafletMap = memo(function LeafletMap({
  center,
  zoom,
  markers,
  selectedListing,
  onMarkerClick,
  onPopupClose,
}: LeafletMapProps) {
  const popupRef = useRef<L.Popup | null>(null);

  useEffect(() => {
    if (popupRef.current) popupRef.current.update();
  }, [selectedListing]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
    >
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onPopupClose={onPopupClose} />

      {markers.map((marker, idx) => (
        <Marker
          key={idx}
          position={marker.position}
          eventHandlers={{ click: () => onMarkerClick(marker.item) }}
          icon={marker.type === "university" ? universityIcon : listingIcon}
          opacity={marker.type === "listing" ? 0.9 : 1} // 💡 Make listings slightly transparent
        >
          <Popup ref={popupRef}>{marker.popupContent}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
});

export default LeafletMap;

// src/components/ui/LocationPicker.tsx
"use client";
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";
import L from "leaflet";

// FIX: Default Leaflet icon path
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Type for the props our component will accept
type LocationPickerProps = {
  // A function to call when the location changes
  onChange: (lat: number, lng: number) => void;
};

// Search bar component
function LeafletSearch({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: "bar",
      autoComplete: true,
      autoCompleteDelay: 250,
      showMarker: false,
      retainZoomLevel: false,
    });

    map.addControl(searchControl);

    // Event listener for when a search result is selected
    const onResult = (e: any) => {
      onLocationSelect(e.location.y, e.location.x); // e.location.y is lat, e.location.x is lng
      map.setView([e.location.y, e.location.x], 15); // Center map on result
    };

    map.on("geosearch/showlocation", onResult);

    return () => {
      map.removeControl(searchControl);
      map.off("geosearch/showlocation", onResult);
    };
  }, [map, onLocationSelect]);

  return null;
}

// Click handler component
function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// The main component
export function LocationPicker({ onChange }: LocationPickerProps) {
  // Default to a central location in Sri Lanka
  const [position, setPosition] = useState<[number, number]>([7.8731, 80.7718]);

  const handleLocationChange = (lat: number, lng: number) => {
    setPosition([lat, lng]);
    onChange(lat, lng); // Send data back to the form
  };

  return (
    <MapContainer
      center={position}
      zoom={7}
      style={{ height: "400px", width: "100%", borderRadius: "8px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position} />
      <MapClickHandler onMapClick={handleLocationChange} />
      <LeafletSearch onLocationSelect={handleLocationChange} />
    </MapContainer>
  );
}

'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef } from 'react';
import type { Listing } from '@/lib/types';

// Fix for default icon not showing in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const universityIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/plasticine/100/university.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
});

const listingIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/office/80/marker.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
    popupAnchor: [0, -35],
});

type University = {
  name: string;
  lat: number;
  lng: number;
};

type MarkerData = {
    position: [number, number];
    popupContent: React.ReactNode;
    item: Listing | University;
    type: 'university' | 'listing';
};

type LeafletMapProps = {
  center: [number, number];
  zoom: number;
  markers: MarkerData[];
  selectedListing: Listing | null;
  onMarkerClick: (item: Listing | University) => void;
  onPopupClose: () => void;
};

function ChangeView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function LeafletMap({ center, zoom, markers, selectedListing, onMarkerClick, onPopupClose }: LeafletMapProps) {
  const popupRef = useRef<L.Popup | null>(null);

  const MapEvents = () => {
    useMapEvents({
      popupclose: onPopupClose,
    });
    return null;
  };

  useEffect(() => {
    if (popupRef.current) {
      popupRef.current.update();
    }
  }, [selectedListing]);

  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 1 }}>
      <ChangeView center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents />
      {markers.map((marker, idx) => (
        <Marker 
          key={idx} 
          position={marker.position} 
          eventHandlers={{ click: () => onMarkerClick(marker.item) }}
          icon={marker.type === 'university' ? universityIcon : listingIcon}
        >
          {marker.type === 'listing' && (
             <Popup ref={popupRef}>
               {marker.popupContent}
             </Popup>
          )}
           {marker.type === 'university' && (
             <Popup>{marker.popupContent}</Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}

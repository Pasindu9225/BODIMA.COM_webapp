"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Marker icon for listing
const listingIcon = new L.Icon({
  iconUrl: "https://img.icons8.com/office/80/marker.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

export default function ListingDetailsPage() {
  const { id } = useParams(); // /listing/[id]
  const [listing, setListing] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  // Leaflet map & routing refs
  const mapRef = useRef<LeafletMap | null>(null);
  const routeControlRef = useRef<any>(null);

  // Fetch listing details from API
  useEffect(() => {
    async function fetchListing() {
      try {
        const res = await fetch(`/api/listings/${id}`);
        if (!res.ok) throw new Error("Failed to fetch listing");
        const data = await res.json();
        setListing(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchListing();
  }, [id]);

  const handleGetDirections = () => {
    if (!listing || !mapRef.current) return;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const start: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setUserLocation(start);

        // Remove previous route if it exists
        if (routeControlRef.current && mapRef.current) {
          mapRef.current.removeControl(routeControlRef.current);
          routeControlRef.current = null;
        }

        // Use `any` because TypeScript doesn't know about L.Routing
        const routing = (L as any).Routing.control({
          waypoints: [
            L.latLng(start[0], start[1]),
            L.latLng(listing.lat, listing.lng),
          ],
          lineOptions: { styles: [{ color: "#007bff", weight: 5 }] },
          createMarker: () => null,
          addWaypoints: false,
          draggableWaypoints: false,
          show: false,
        }).addTo(mapRef.current as LeafletMap);

        routeControlRef.current = routing;
      },
      (err) => {
        alert("Unable to retrieve your location.");
        console.error(err);
      }
    );
  };

  if (!listing) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6">
      {/* LEFT: Details */}
      <div className="flex-1 space-y-3">
        <h1 className="text-2xl font-bold">{listing.title}</h1>
        <p className="text-gray-400">{listing.address}</p>
        <p className="font-semibold text-blue-400">
          LKR {listing.price.toLocaleString()} / month
        </p>

        <p className="text-sm text-gray-300">{listing.description}</p>

        {/* 🔹 Photos */}
        {listing.photos && listing.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {listing.photos.map((photo: any) => (
              <img
                key={photo.id}
                src={photo.url}
                alt="Listing photo"
                className="w-full h-48 object-cover rounded-lg shadow"
              />
            ))}
          </div>
        )}

        {/* 🔹 Provider Info */}
        {listing.provider && (
          <div className="mt-4 border-t border-gray-700 pt-3">
            <h2 className="font-semibold text-lg mb-1">Provider Details</h2>
            <p>
              <strong>Name:</strong> {listing.provider.name}
            </p>
            <p>
              <strong>Email:</strong> {listing.provider.email}
            </p>
            {listing.provider.phone && (
              <p>
                <strong>Phone:</strong> {listing.provider.phone}
              </p>
            )}
          </div>
        )}

        {/* 🔹 Actions */}
        <button
          onClick={handleGetDirections}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Get Directions
        </button>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-2 text-blue-400 underline text-sm"
        >
          Open in Google Maps
        </a>
      </div>

      {/* RIGHT: Map */}
      <div className="flex-1 h-[400px] rounded-lg overflow-hidden">
        <MapContainer
          center={[listing.lat, listing.lng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef as any}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <Marker position={[listing.lat, listing.lng]} icon={listingIcon}>
            <Popup>{listing.title}</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

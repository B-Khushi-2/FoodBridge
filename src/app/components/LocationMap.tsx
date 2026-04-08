import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  location?: { lat: number; lng: number };
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  editable?: boolean;
  height?: string;
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; popup?: string }>;
}

function MapController({ location }: { location: { lat: number; lng: number } }) {
  const map = useMap();
  
  useEffect(() => {
    if (location) {
      map.setView([location.lat, location.lng], map.getZoom());
    }
  }, [location, map]);
  
  return null;
}

export function LocationMap({ 
  location, 
  onLocationSelect, 
  editable = false, 
  height = '300px',
  zoom = 13,
  markers = []
}: LocationMapProps) {
  const [currentLocation, setCurrentLocation] = useState(
    location || { lat: 28.6139, lng: 77.2090 } // Default to New Delhi, India
  );
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's real-time location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          if (!location) {
            setCurrentLocation(loc);
            onLocationSelect?.(loc);
          }
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          // Keep default Delhi location
        }
      );
    }
  }, []);

  const handleMapClick = (e: any) => {
    if (editable) {
      const newLocation = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      setCurrentLocation(newLocation);
      onLocationSelect?.(newLocation);
    }
  };

  return (
    <div style={{ height, borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer
        center={[currentLocation.lat, currentLocation.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController location={currentLocation} />
        
        {/* Main marker */}
        <Marker position={[currentLocation.lat, currentLocation.lng]}>
          <Popup>
            <div className="text-sm">
              <strong>Pickup Location</strong>
              <br />
              {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              {editable && <div className="text-xs text-gray-500 mt-1">Click map to change</div>}
            </div>
          </Popup>
        </Marker>

        {/* User's current location (if different) */}
        {userLocation && (userLocation.lat !== currentLocation.lat || userLocation.lng !== currentLocation.lng) && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={L.divIcon({
              className: 'custom-user-marker',
              html: '<div style="background-color: #3B82F6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>
              <div className="text-sm">
                <strong>Your Location</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Additional markers */}
        {markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

// Simpler static map display
export function StaticLocationMap({ location, height = '200px' }: { location: { lat: number; lng: number }, height?: string }) {
  return (
    <LocationMap location={location} editable={false} height={height} zoom={15} />
  );
}

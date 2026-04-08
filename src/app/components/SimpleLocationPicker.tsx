import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Search } from 'lucide-react';
import { Button } from './ui/button';

// Fix Leaflet default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface SimpleLocationPickerProps {
  location: { lat: number; lng: number };
  onLocationSelect?: (location: { lat: number; lng: number }, address?: string) => void;
  editable?: boolean;
  height?: string;
}

// Re-centers the map when coordinates change
function MapRecenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 13, { animate: true });
  }, [lat, lng]);
  return null;
}

// Handles click on map to set location
function MapClickHandler({ onSelect }: { onSelect: (loc: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e: any) {
      onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });
  return null;
}

export function SimpleLocationPicker({
  location,
  onLocationSelect,
  editable = false,
  height = '300px'
}: SimpleLocationPickerProps) {
  const [geoError, setGeoError] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [mapKey, setMapKey] = useState(0); // force map remount when needed
  const markerRef = useRef<any>(null);

  // Geocode city name → coordinates using OpenStreetMap Nominatim (free, no API key)
  const geocodeCity = useCallback(async (city: string) => {
    if (!city.trim()) return;
    setGeocoding(true);
    setGeoError('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'FoodBridgeApp/1.0' }
      });
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newLoc = { lat: parseFloat(lat), lng: parseFloat(lon) };
        onLocationSelect?.(newLoc, display_name);
        setMapKey(k => k + 1); // Force map to remount with new center
      } else {
        setGeoError(`Could not find "${city}". Try a different city name.`);
      }
    } catch {
      setGeoError('Geocoding failed. Check your internet connection.');
    } finally {
      setGeocoding(false);
    }
  }, [onLocationSelect]);

  // Reverse geocode coordinates → city name
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
      const res = await fetch(url, {
        headers: { 'Accept-Language': 'en', 'User-Agent': 'FoodBridgeApp/1.0' }
      });
      const data = await res.json();
      if (data && data.display_name) {
        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state || data.display_name;
        setCityInput(city);
        onLocationSelect?.({ lat, lng }, data.display_name);
      }
    } catch {
      // silent fail
    }
  }, [onLocationSelect]);

  const handleUseCurrentLocation = () => {
    setGeoError('');
    if (navigator.geolocation && onLocationSelect) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          onLocationSelect({ lat, lng });
          reverseGeocode(lat, lng);
          setMapKey(k => k + 1);
        },
        () => setGeoError('Location access denied. Please allow location permission or search manually.'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGeoError('Geolocation not supported by your browser.');
    }
  };

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker && onLocationSelect) {
      const pos = marker.getLatLng();
      onLocationSelect({ lat: pos.lat, lng: pos.lng });
      reverseGeocode(pos.lat, pos.lng);
    }
  };

  const handleMapClick = (loc: { lat: number; lng: number }) => {
    onLocationSelect?.(loc);
    reverseGeocode(loc.lat, loc.lng);
  };

  const handleLatChange = (val: number) => {
    onLocationSelect?.({ ...location, lat: val });
    setMapKey(k => k + 1);
  };

  const handleLngChange = (val: number) => {
    onLocationSelect?.({ ...location, lng: val });
    setMapKey(k => k + 1);
  };

  return (
    <div className="space-y-3">
      {/* City search with geocoding */}
      {editable && (
        <div className="flex gap-2">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && geocodeCity(cityInput)}
            placeholder="Search city (e.g. Aurangabad, Mumbai...)"
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
          />
          <button
            type="button"
            onClick={() => geocodeCity(cityInput)}
            disabled={geocoding}
            className="px-3 py-2 bg-[#2D6A4F] text-white rounded-lg hover:bg-[#235a41] disabled:opacity-50"
          >
            {geocoding ? '...' : <Search className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Leaflet Map — key forces remount when center needs to change */}
      <div style={{ height }} className="rounded-xl overflow-hidden border-2 border-gray-200">
        <MapContainer
          key={mapKey}
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={[location.lat, location.lng]}
            draggable={editable}
            ref={markerRef}
            eventHandlers={editable ? { dragend: handleMarkerDragEnd } : {}}
          />
          {editable && onLocationSelect && (
            <MapClickHandler onSelect={handleMapClick} />
          )}
        </MapContainer>
      </div>

      {/* Coordinates + controls */}
      {editable && onLocationSelect && (
        <div className="space-y-2">
          <Button
            type="button"
            onClick={handleUseCurrentLocation}
            className="w-full bg-[#2D6A4F] hover:bg-[#235a41] text-white rounded-xl"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Use Current Location
          </Button>

          {geoError && (
            <p className="text-xs text-red-500 text-center">{geoError}</p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.0001"
              value={location.lat}
              onChange={(e) => handleLatChange(parseFloat(e.target.value) || 0)}
              placeholder="Latitude"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
            <input
              type="number"
              step="0.0001"
              value={location.lng}
              onChange={(e) => handleLngChange(parseFloat(e.target.value) || 0)}
              placeholder="Longitude"
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]"
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            Search city, click map, drag marker, or enter coordinates
          </p>
        </div>
      )}

      {!editable && (
        <div className="text-center">
          <p className="text-xs text-gray-600">
            Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
          </p>
          <a
            href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#2D6A4F] hover:underline"
          >
            View on Google Maps →
          </a>
        </div>
      )}
    </div>
  );
}

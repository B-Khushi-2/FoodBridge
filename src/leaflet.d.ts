// Allow leaflet and react-leaflet to be imported without strict types
declare module 'leaflet';
declare module 'react-leaflet' {
  import * as React from 'react';
  export const MapContainer: React.FC<any>;
  export const TileLayer: React.FC<any>;
  export const Marker: React.FC<any>;
  export const Popup: React.FC<any>;
  export function useMap(): any;
  export function useMapEvents(handlers: any): any;
}

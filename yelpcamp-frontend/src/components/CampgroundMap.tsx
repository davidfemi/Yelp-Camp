import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Campground } from '../services/api';

// Mapbox access token - you'll need to set this in your environment
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGF2aWRjb2RlcyIsImEiOiJjbTUxbWU1d3MxcnhuMmpwcHd3cmdpZTJmIn0.OC6rGCDPkAWNvYVGM99rvQ';

interface CampgroundMapProps {
  campground: Campground;
  height?: string;
}

const CampgroundMap: React.FC<CampgroundMapProps> = ({ campground, height = '300px' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !campground.geometry?.coordinates) return;

    // Set the access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: campground.geometry.coordinates,
      zoom: 10
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl());

    // Add marker for the campground
    new mapboxgl.Marker({ color: "#FFFA500" })
      .setLngLat(campground.geometry.coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<h6>${campground.title}</h6><p>${campground.location}</p>`)
      )
      .addTo(map.current);

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [campground]);

  if (!campground.geometry?.coordinates) {
    return (
      <div 
        style={{ 
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}
      >
        <p className="text-muted mb-0">Location not available</p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      style={{ 
        width: '100%', 
        height: height,
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
};

export default CampgroundMap; 
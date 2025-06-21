import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Campground } from '../services/api';

// Mapbox access token - you'll need to set this in your environment
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || 'pk.eyJ1IjoiZGF2aWRjb2RlcyIsImEiOiJjbTUxbWU1d3MxcnhuMmpwcHd3cmdpZTJmIn0.OC6rGCDPkAWNvYVGM99rvQ';

interface CampgroundsMapProps {
  campgrounds: Campground[];
  height?: string;
}

const CampgroundsMap: React.FC<CampgroundsMapProps> = ({ campgrounds, height = '500px' }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set the access token
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Initialize the map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [-103.5917, 40.6699], // Center of US
      zoom: 3
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl());

    // Wait for map to load before adding sources and layers
    map.current.on('load', () => {
      if (!map.current) return;

      // Convert campgrounds to GeoJSON format
      const geojsonData = {
        type: 'FeatureCollection' as const,
        features: campgrounds
          .filter(campground => campground.geometry?.coordinates)
          .map(campground => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: campground.geometry!.coordinates
            },
            properties: {
              cluster: false,
              campgroundId: campground._id,
              title: campground.title,
              location: campground.location,
              price: campground.price,
              popUpMarkUp: `
                <div>
                  <h6>${campground.title}</h6>
                  <p>${campground.location}</p>
                  <p><strong>$${campground.price}/night</strong></p>
                  <a href="/campgrounds/${campground._id}" target="_blank" rel="noopener noreferrer">
                    View Details
                  </a>
                </div>
              `
            }
          }))
      };

      // Add the campgrounds source
      map.current.addSource('campgrounds', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });

      // Add cluster layer
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#F1C40F',
            10,
            '#FF6600',
            30,
            '#16A085'
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            15,
            10,
            20,
            30,
            25
          ]
        }
      });

      // Add cluster count layer
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });

      // Add unclustered points layer
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 14,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }
      });

      // Add click handlers
      map.current.on('click', 'clusters', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        
        if (!features || features.length === 0 || !features[0].properties) return;
        
        const clusterId = features[0].properties.cluster_id;
        const source = map.current.getSource('campgrounds') as mapboxgl.GeoJSONSource;
        
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current || zoom === null || zoom === undefined) return;
          
          map.current.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom
          });
        });
      });

      // Add popup for individual campgrounds
      map.current.on('click', 'unclustered-point', (e) => {
        if (!map.current || !e.features || e.features.length === 0) return;
        
        const feature = e.features[0];
        if (!feature.properties) return;
        
        const coordinates = (feature.geometry as any).coordinates.slice();
        const popUpMarkUp = feature.properties.popUpMarkUp;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(popUpMarkUp)
          .addTo(map.current);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'clusters', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'clusters', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });

      map.current.on('mouseenter', 'unclustered-point', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer';
        }
      });

      map.current.on('mouseleave', 'unclustered-point', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = '';
        }
      });
    });

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [campgrounds]);

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

export default CampgroundsMap; 
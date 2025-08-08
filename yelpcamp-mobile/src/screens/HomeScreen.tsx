import * as React from 'react';
const { useState, useEffect, useMemo } = React;
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { campgroundsAPI } from '../services/api';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';


const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  HomeTab: undefined;
  ExploreTab: undefined;
  ShopTab: undefined;
  ProfileTab: undefined;
  CampgroundDetail: { campgroundId: string };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeTab'>;

interface Campground {
  _id: string;
  title: string;
  location: string;
  price: number;
  geometry: {
    coordinates: [number, number];
  };
  images: Array<{ url: string }>;
}

interface ClusterMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  count: number;
  campgrounds: Campground[];
  isCluster: boolean;
}

// Clustering utility functions
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const createClusters = (campgrounds: Campground[], zoomLevel: number): ClusterMarker[] => {
  if (!campgrounds.length) return [];
  
  // Adjust cluster radius based on zoom level - more aggressive clustering at lower zoom
  const baseRadius = 100; // Base radius in km
  const clusterRadius = baseRadius / Math.pow(2, Math.max(0, zoomLevel - 6));
  
  const clusters: ClusterMarker[] = [];
  const processed = new Set<string>();
  
  campgrounds.forEach((campground) => {
    if (processed.has(campground._id) || !campground.geometry?.coordinates) return;
    
    const [longitude, latitude] = campground.geometry.coordinates;
    const nearbyPoints: Campground[] = [campground];
    processed.add(campground._id);
    
    // Find nearby campgrounds to cluster
    campgrounds.forEach((other) => {
      if (processed.has(other._id) || !other.geometry?.coordinates) return;
      
      const [otherLon, otherLat] = other.geometry.coordinates;
      const distance = calculateDistance(latitude, longitude, otherLat, otherLon);
      
      if (distance <= clusterRadius) {
        nearbyPoints.push(other);
        processed.add(other._id);
      }
    });
    
    if (nearbyPoints.length > 1) {
      // Create cluster
      const avgLat = nearbyPoints.reduce((sum, p) => sum + p.geometry.coordinates[1], 0) / nearbyPoints.length;
      const avgLon = nearbyPoints.reduce((sum, p) => sum + p.geometry.coordinates[0], 0) / nearbyPoints.length;
      
      clusters.push({
        id: `cluster-${latitude}-${longitude}`,
        coordinate: { latitude: avgLat, longitude: avgLon },
        count: nearbyPoints.length,
        campgrounds: nearbyPoints,
        isCluster: true,
      });
    } else {
      // Single marker
      clusters.push({
        id: campground._id,
        coordinate: { latitude, longitude },
        count: 1,
        campgrounds: [campground],
        isCluster: false,
      });
    }
  });
  
  return clusters;
};



// Dark map style
const DARK_MAP_STYLE = [
  {
    "elementType": "geometry",
    "stylers": [{"color": "#212121"}]
  },
  {
    "elementType": "labels.icon",
    "stylers": [{"visibility": "off"}]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{"color": "#757575"}]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [{"color": "#212121"}]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{"color": "#757575"}]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{"color": "#2c2c2c"}]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{"color": "#000000"}]
  }
];

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [campgrounds, setCampgrounds] = useState<Campground[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 39.8283,
    longitude: -98.5795,
    latitudeDelta: 50,
    longitudeDelta: 50,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentMapStyle] = useState('dark');
  const [zoomLevel, setZoomLevel] = useState(8);
  const [clusteringEnabled, setClusteringEnabled] = useState(true);

  // Calculate zoom level from region
  const calculateZoomLevel = (region: any) => {
    const zoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
    return Math.max(1, Math.min(zoom, 20));
  };

  // Cluster markers based on zoom level
  const clusteredMarkers = useMemo(() => {
    if (!clusteringEnabled) {
      // Return individual markers when clustering is disabled
      return campgrounds
        .filter(c => c.geometry?.coordinates)
        .map(c => ({
          id: c._id,
          coordinate: {
            latitude: c.geometry.coordinates[1],
            longitude: c.geometry.coordinates[0],
          },
          count: 1,
          campgrounds: [c],
          isCluster: false,
        }));
    }
    
    const clusters = createClusters(campgrounds, zoomLevel);
    console.log(`Clustering: ${campgrounds.length} campgrounds → ${clusters.length} markers at zoom ${zoomLevel}`);
    const clusterCount = clusters.filter(c => c.isCluster).length;
    const individualCount = clusters.filter(c => !c.isCluster).length;
    console.log(`  ${clusterCount} clusters, ${individualCount} individual markers`);
    return clusters;
  }, [campgrounds, zoomLevel, clusteringEnabled]);

  useEffect(() => {
    requestLocationPermission();
    fetchAllCampgrounds();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation(location);
        // Don't automatically zoom to user location - let campgrounds view take priority
        console.log('User location obtained:', location.coords.latitude, location.coords.longitude);
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  const fetchAllCampgrounds = async () => {
    try {
      setIsLoading(true);
      // Fetch all campgrounds without pagination limit
      const response = await campgroundsAPI.getAll({ limit: 1000 });
      if (response.success && response.data) {
        const campgroundsData = response.data.campgrounds;
        setCampgrounds(campgroundsData);
        console.log(`Loaded ${campgroundsData.length} campgrounds on map`);
        
        // Automatically fit all campgrounds on the map
        if (campgroundsData.length > 0) {
          const coordinates = campgroundsData
            .filter((c: Campground) => c.geometry?.coordinates)
            .map((c: Campground) => ({
              latitude: c.geometry.coordinates[1],
              longitude: c.geometry.coordinates[0],
            }));

          if (coordinates.length > 0) {
            // Calculate bounds to fit all campgrounds
            const minLat = Math.min(...coordinates.map((c: {latitude: number, longitude: number}) => c.latitude));
            const maxLat = Math.max(...coordinates.map((c: {latitude: number, longitude: number}) => c.latitude));
            const minLng = Math.min(...coordinates.map((c: {latitude: number, longitude: number}) => c.longitude));
            const maxLng = Math.max(...coordinates.map((c: {latitude: number, longitude: number}) => c.longitude));

            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;
            const deltaLat = (maxLat - minLat) * 1.3; // Add padding
            const deltaLng = (maxLng - minLng) * 1.3;

            setMapRegion({
              latitude: centerLat,
              longitude: centerLng,
              latitudeDelta: Math.max(deltaLat, 1),
              longitudeDelta: Math.max(deltaLng, 1),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching campgrounds for map:', error);
      Alert.alert('Error', 'Failed to load campgrounds. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerPress = (campground: Campground) => {
    Alert.alert(
      campground.title,
      `Location: ${campground.location}\nPrice: $${campground.price}/night`,
      [
        {
          text: 'View Details',
          onPress: () => navigation.navigate('CampgroundDetail', { 
            campgroundId: campground._id 
          }),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleClusterPress = (cluster: ClusterMarker) => {
    if (cluster.isCluster) {
      // Show options for cluster
      const options = [
        { text: 'Cancel', style: 'cancel' as const },
        {
          text: 'Zoom In',
          onPress: () => {
            setMapRegion({
              latitude: cluster.coordinate.latitude,
              longitude: cluster.coordinate.longitude,
              latitudeDelta: mapRegion.latitudeDelta / 2,
              longitudeDelta: mapRegion.longitudeDelta / 2,
            });
          },
        },
      ];

      // Add individual campground options if cluster is small
      if (cluster.count <= 5) {
        cluster.campgrounds.forEach((campground, index) => {
          options.splice(-1, 0, {
            text: `${campground.title} ($${campground.price}/night)`,
            onPress: () => handleMarkerPress(campground),
          });
        });
      }

      Alert.alert(
        `${cluster.count} Campgrounds`,
        `This cluster contains ${cluster.count} campgrounds in this area.`,
        options
      );
    } else {
      // Single campground
      handleMarkerPress(cluster.campgrounds[0]);
    }
  };

  const handleRegionChange = (region: any) => {
    setMapRegion(region);
    const newZoomLevel = calculateZoomLevel(region);
    setZoomLevel(newZoomLevel);
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      setMapRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    } else {
      requestLocationPermission();
    }
  };

  const fitAllCampgrounds = () => {
    if (campgrounds.length === 0) return;
    
    const coordinates = campgrounds
      .filter(c => c.geometry?.coordinates)
      .map(c => ({
        latitude: c.geometry.coordinates[1],
        longitude: c.geometry.coordinates[0],
      }));

    if (coordinates.length > 0) {
      // Calculate bounds to fit all campgrounds
      const minLat = Math.min(...coordinates.map(c => c.latitude));
      const maxLat = Math.max(...coordinates.map(c => c.latitude));
      const minLng = Math.min(...coordinates.map(c => c.longitude));
      const maxLng = Math.max(...coordinates.map(c => c.longitude));

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const deltaLat = (maxLat - minLat) * 1.2; // Add padding
      const deltaLng = (maxLng - minLng) * 1.2;

      setMapRegion({
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(deltaLat, 1),
        longitudeDelta: Math.max(deltaLng, 1),
      });
    }
  };

  const mapStyleConfig = { 
    mapType: 'standard' as const,
    customMapStyle: DARK_MAP_STYLE 
  };

  return (
    <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/thecampgrounds-logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.headerTitle}>The Campgrounds</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {isLoading ? 'Loading...' : `${campgrounds.length} locations • ${clusteredMarkers.length} markers • Zoom ${zoomLevel} • ${clusteringEnabled ? 'Clustered' : 'Individual'}`}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {/* Profile button removed - available in bottom tab navigation */}
        </View>
      </View>

      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={mapRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={isLoading}
          onRegionChangeComplete={handleRegionChange}
          {...mapStyleConfig}
        >
          {clusteredMarkers.map((cluster) => (
            <Marker
              key={cluster.id}
              coordinate={cluster.coordinate}
              title={cluster.isCluster ? `${cluster.count} Campgrounds` : cluster.campgrounds[0].title}
              description={
                cluster.isCluster 
                  ? `Tap to see options` 
                  : `$${cluster.campgrounds[0].price}/night`
              }
              onPress={() => handleClusterPress(cluster)}
            >
              {cluster.isCluster ? (
                <View style={styles.clusterContainer}>
                  <View style={[styles.clusterFill, cluster.count > 10 ? styles.largeCluster : styles.smallCluster]}>
                    <Text style={styles.clusterText}>{cluster.count}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.markerContainer}>
                  <View style={styles.markerFill}>
                    <Ionicons name="business" size={14} color="#fff" />
                  </View>
                </View>
              )}
            </Marker>
          ))}
          
          {userLocation && (
            <Marker
              coordinate={{
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
              }}
              title="Your Location"
              description="You are here"
            >
              <View style={styles.userMarkerContainer}>
                <View style={styles.userMarkerFill}>
                  <Ionicons name="person" size={12} color="#fff" />
                </View>
              </View>
            </Marker>
          )}
        </MapView>

        {/* Map Control Buttons */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={[styles.controlButton, clusteringEnabled && styles.controlButtonActive]}
            onPress={() => setClusteringEnabled(!clusteringEnabled)}
          >
            <Ionicons name="apps" size={24} color={clusteringEnabled ? "#fff" : "#4A5D23"} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.controlButton}
            onPress={centerOnUserLocation}
          >
            <Ionicons name="locate" size={24} color="#4A5D23" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={fitAllCampgrounds}
          >
            <Ionicons name="expand" size={24} color="#4A5D23" />
          </TouchableOpacity>
        </View>




          </View>



      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <Image 
              source={require('../../assets/thecampgrounds-logo.png')} 
              style={styles.loadingLogo}
              resizeMode="contain"
            />
            <Text style={styles.loadingText}>Loading campgrounds...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerLeft: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A5D23',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 5,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerFill: {
    width: 20,
    height: 20,
    backgroundColor: '#4A5D23',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  userMarkerContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerFill: {
    width: 20,
    height: 20,
    backgroundColor: '#2196F3',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  mapControls: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'column',
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  controlButtonActive: {
    backgroundColor: '#4A5D23',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  loadingLogo: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#4A5D23',
    fontWeight: '500',
  },

  clusterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterFill: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  smallCluster: {
    width: 36,
    height: 36,
    backgroundColor: '#FF6B35',
  },
  largeCluster: {
    width: 44,
    height: 44,
    backgroundColor: '#D32F2F',
  },
  clusterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },

});
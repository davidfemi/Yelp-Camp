import * as React from 'react';
const { useState, useEffect } = React;
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { StackScreenProps } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, Campground } from '../types';
import { campgroundsAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Intercom from '@intercom/intercom-react-native';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

type Props = StackScreenProps<RootStackParamList, 'CampgroundDetail'>;
type CampgroundDetailNavigationProp = StackNavigationProp<RootStackParamList, 'CampgroundDetail'>;

export default function CampgroundDetailScreen({ route }: Props) {
  const { campgroundId } = route.params;
  const navigation = useNavigation<CampgroundDetailNavigationProp>();
  const { user } = useAuth();
  const [campground, setCampground] = useState<Campground | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { showError } = useToast();

  useEffect(() => {
    fetchCampgroundDetails();
  }, []);

  const fetchCampgroundDetails = async () => {
    try {
      const response = await campgroundsAPI.getById(campgroundId);
      const campgroundData = response.data?.campground || response.campground || response;
      setCampground(campgroundData);
      
      // Track campground view in Intercom
      if (campgroundData) {
        Intercom.logEvent('campground_viewed', {
          campground_id: campgroundData._id,
          campground_name: campgroundData.title,
          campground_location: campgroundData.location,
          campground_price: campgroundData.price,
          available_spots: campgroundData.availableSpots || (campgroundData.capacity ? campgroundData.capacity - (campgroundData.peopleBooked || 0) : 0),
          user_id: user?.id || 'anonymous',
        });
      }
    } catch (error) {
      console.error('Error fetching campground details:', error);
      showError('Failed to load campground details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading campground..." />;
  }

  if (!campground) {
    return (
      <EmptyState
        icon="alert-circle-outline"
        title="Campground not found"
        description="This campground could not be loaded. Please try again or choose a different campground."
        actionText="Go Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const images = campground.images || [];
  const totalImages = images.length;
  const hasImages = totalImages > 0;

  const renderStars = (rating: number = 4.5) => {
    const stars: React.JSX.Element[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={16} color="#FFD700" />);
    }
    if (hasHalfStar) {
      stars.push(<Ionicons key="half" name="star-half" size={16} color="#FFD700" />);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Ionicons key={`empty-${i}`} name="star-outline" size={16} color="#FFD700" />);
    }
    return stars;
  };

  const availableSpots = campground.availableSpots || 
    (campground.capacity && campground.peopleBooked ? campground.capacity - campground.peopleBooked : null);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image Section */}
        <View style={styles.heroContainer}>
          {hasImages ? (
            <Image 
              source={{ uri: images[currentImageIndex].url }} 
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderHero}>
              <Ionicons name="image-outline" size={80} color="rgba(255,255,255,0.7)" />
            </View>
          )}
          
          {/* Header Overlay */}
          <View style={styles.headerOverlay}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            {hasImages && totalImages > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentImageIndex + 1} / {totalImages}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentContainer}>
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{campground.title}</Text>
            
            {/* Rating Section */}
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {renderStars()}
              </View>
              <Text style={styles.ratingText}>4.5 (250+ reviews)</Text>
            </View>
          </View>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View>
              <Text style={styles.priceLabel}>Price per night</Text>
              <Text style={styles.priceValue}>${campground.price}</Text>
            </View>
            
            {availableSpots && (
              <View style={styles.availabilityBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                <Text style={styles.availabilityText}>{availableSpots} spots available</Text>
              </View>
            )}
          </View>

          {/* Camp Details Section */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Camp details</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color="#8e8e93" />
                <Text style={styles.detailText}>{campground.location}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="people-outline" size={20} color="#8e8e93" />
                <Text style={styles.detailText}>Capacity: {campground.capacity || 'Not specified'}</Text>
              </View>
              
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={20} color="#8e8e93" />
                <Text style={styles.detailText}>Check-in: Flexible</Text>
              </View>
            </View>
          </View>

          {/* Book Now Button */}
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => navigation.navigate('BookingForm', { campgroundId })}
          >
            <Text style={styles.bookButtonText}>Check availability</Text>
          </TouchableOpacity>

          {/* About Section */}
          <View style={styles.aboutSection}>
            <View style={styles.aboutHeader}>
              <Text style={styles.aboutTitle}>About this experience</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.description}>{campground.description}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  placeholderHero: {
    width: '100%',
    height: '100%',
    backgroundColor: '#4A5D23',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  contentContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1d1d1f',
    lineHeight: 34,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#8e8e93',
    fontWeight: '600',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 16,
    color: '#8e8e93',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1d1d1f',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  availabilityText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
    marginLeft: 4,
  },
  detailsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1d1f',
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailText: {
    fontSize: 16,
    color: '#1d1d1f',
    marginLeft: 12,
    fontWeight: '500',
  },
  bookButton: {
    backgroundColor: '#5856D6',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#5856D6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  aboutSection: {
    borderTopWidth: 1,
    borderTopColor: '#f2f2f7',
    paddingTop: 24,
  },
  aboutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d1d1f',
  },
  seeAllText: {
    fontSize: 16,
    color: '#5856D6',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#6d6d70',
    lineHeight: 24,
    fontWeight: '400',
  },
}); 
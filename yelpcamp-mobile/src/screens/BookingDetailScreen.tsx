import * as React from 'react';
const { useState, useEffect } = React;
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, Booking } from '../types';
import { bookingsAPI } from '../services/api';

type Props = StackScreenProps<RootStackParamList, 'BookingDetail'>;
type BookingDetailNavigationProp = StackNavigationProp<RootStackParamList, 'BookingDetail'>;

export default function BookingDetailScreen({ route }: Props) {
  const { bookingId } = route.params;
  const navigation = useNavigation<BookingDetailNavigationProp>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const fetchBookingDetails = async () => {
    try {
      const response = await bookingsAPI.getBookingById(bookingId);
      setBooking(response.data.booking);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      Alert.alert('Error', 'Failed to load booking details. Please try again.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      case 'expired':
        return '#9E9E9E';
      default:
        return '#2196F3';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'expired':
        return 'hourglass';
      default:
        return 'information-circle';
    }
  };

  const handleCancelBooking = () => {
    if (!booking) return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: confirmCancelBooking,
        },
      ]
    );
  };

  const confirmCancelBooking = async () => {
    // This would typically call an API to cancel the booking
    // For now, we'll just show a success message
    Alert.alert(
      'Booking Cancelled',
      'Your booking has been cancelled. You will receive a confirmation email shortly.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleViewCampground = () => {
    if (booking?.campground) {
      navigation.navigate('CampgroundDetail', { 
        campgroundId: booking.campground._id 
      });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#4A5D23" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#4A5D23" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking Details</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left','right','bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4A5D23" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Booking Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={getStatusIcon(booking.status)} 
              size={24} 
              color={getStatusColor(booking.status)} 
            />
            <Text style={[styles.statusTitle, { color: getStatusColor(booking.status) }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.bookingDate}>
            Booked on {formatDateTime(booking.createdAt)}
          </Text>
        </View>

        {/* Campground Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campground</Text>
          <TouchableOpacity style={styles.campgroundCard} onPress={handleViewCampground}>
            <View style={styles.campgroundInfo}>
              {booking.campground.images && booking.campground.images.length > 0 ? (
                <Image
                  source={{ uri: booking.campground.images[0].url }}
                  style={styles.campgroundImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="image-outline" size={30} color="#ccc" />
                </View>
              )}
              
              <View style={styles.campgroundDetails}>
                <Text style={styles.campgroundName}>{booking.campground.title}</Text>
                <Text style={styles.campgroundLocation}>{booking.campground.location}</Text>
                <Text style={styles.campgroundPrice}>${booking.campground.price}/night</Text>
              </View>
            </View>
            
            <View style={styles.viewCampgroundContainer}>
              <Ionicons name="chevron-forward" size={20} color="#4A5D23" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stay Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Check-in:</Text>
              <Text style={styles.detailValue}>{formatDate(booking.checkInDate)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Check-out:</Text>
              <Text style={styles.detailValue}>{formatDate(booking.checkOutDate)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Duration:</Text>
              <Text style={styles.detailValue}>{booking.days} night{booking.days !== 1 ? 's' : ''}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Guests:</Text>
              <Text style={styles.detailValue}>{(booking as any).guests || 'Not specified'}</Text>
            </View>
          </View>
        </View>

        {/* Pricing Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.pricingCard}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>
                ${booking.campground.price} × {booking.days} night{booking.days !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.pricingValue}>${booking.totalPrice.toFixed(2)}</Text>
            </View>
            
            <View style={[styles.pricingRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${booking.totalPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Special Requests */}
        {(booking as any).specialRequests && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
            <View style={styles.requestsCard}>
              <Text style={styles.requestsText}>{(booking as any).specialRequests}</Text>
            </View>
          </View>
        )}

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#4A5D23" />
            <Text style={styles.contactButtonText}>Contact Support</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {booking.status === 'confirmed' && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelBooking}>
            <Ionicons name="close-circle-outline" size={20} color="#F44336" />
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A5D23',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  statusSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  campgroundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  campgroundInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  campgroundImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  campgroundDetails: {
    flex: 1,
  },
  campgroundName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  campgroundLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  campgroundPrice: {
    fontSize: 14,
    color: '#4A5D23',
    fontWeight: '500',
  },
  viewCampgroundContainer: {
    padding: 8,
  },
  detailsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  pricingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
  },
  pricingValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5D23',
  },
  requestsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  requestsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  contactButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#4A5D23',
    fontWeight: '500',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
    borderRadius: 12,
  },
  cancelButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#F44336',
    fontWeight: '500',
  },
}); 
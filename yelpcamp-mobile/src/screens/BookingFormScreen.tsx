import * as React from 'react';
const { useState, useEffect } = React;
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList, Campground } from '../types';
import { bookingsAPI, campgroundsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Intercom from '@intercom/intercom-react-native';

type Props = StackScreenProps<RootStackParamList, 'BookingForm'>;

export default function BookingFormScreen({ route, navigation }: Props) {
  const { campgroundId } = route.params;
  const { user } = useAuth();
  const [campground, setCampground] = useState<Campground | null>(null);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCampground();
  }, []);

  const fetchCampground = async () => {
    try {
      const response = await campgroundsAPI.getById(campgroundId);
      setCampground(response.data?.campground || response.campground || response);
    } catch (error) {
      console.error('Error fetching campground:', error);
      Alert.alert('Error', 'Failed to load campground details.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    if (!campground) return 0;
    return campground.price * calculateNights();
  };

  const handleCheckInDateChange = (event: any, selectedDate?: Date) => {
    setShowCheckInPicker(false);
    if (selectedDate) {
      setCheckInDate(selectedDate);
      // Ensure checkout is at least 1 day after checkin
      if (selectedDate >= checkOutDate) {
        setCheckOutDate(new Date(selectedDate.getTime() + 24 * 60 * 60 * 1000));
      }
    }
  };

  const handleCheckOutDateChange = (event: any, selectedDate?: Date) => {
    setShowCheckOutPicker(false);
    if (selectedDate && selectedDate > checkInDate) {
      setCheckOutDate(selectedDate);
    }
  };

  const adjustGuests = (increment: number) => {
    const newCount = guests + increment;
    if (newCount >= 1 && newCount <= 10) {
      setGuests(newCount);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please log in to make a booking.');
      navigation.navigate('Login');
      return;
    }

    if (checkInDate >= checkOutDate) {
      Alert.alert('Invalid Dates', 'Check-out date must be after check-in date.');
      return;
    }

    if (checkInDate < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
      Alert.alert('Invalid Date', 'Check-in date cannot be in the past.');
      return;
    }

    setSubmitting(true);
    try {
      const bookingData = {
        days: calculateNights(),
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        guests,
        specialRequests: specialRequests.trim() || undefined,
      };

      const response = await bookingsAPI.create(campgroundId, bookingData);
      
      // Track booking in Intercom
      if (campground) {
        Intercom.logEvent('booking_created', {
          booking_id: response.data?.booking?._id || 'unknown',
          campground_id: campground._id,
          campground_name: campground.title,
          campground_location: campground.location,
          booking_value: calculateTotal(),
          stay_duration: calculateNights(),
          check_in_date: checkInDate.toISOString(),
          check_out_date: checkOutDate.toISOString(),
          guests: guests,
          user_id: user.id,
        });
      }
      
      Alert.alert(
        'Booking Confirmed!',
        `Your booking for ${campground?.title} has been confirmed. You will receive a confirmation email shortly.`,
        [
          {
            text: 'View Bookings',
            onPress: () => navigation.navigate('Bookings'),
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Failed',
        'There was an error processing your booking. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || !campground) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#4A5D23" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Campground</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#4A5D23" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Campground</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.campgroundInfo}>
          <Text style={styles.campgroundTitle}>{campground.title}</Text>
          <Text style={styles.campgroundLocation}>{campground.location}</Text>
          <Text style={styles.pricePerNight}>${campground.price}/night</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-in Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCheckInPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#4A5D23" />
            <Text style={styles.dateText}>{formatDate(checkInDate)}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-out Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCheckOutPicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#4A5D23" />
            <Text style={styles.dateText}>{formatDate(checkOutDate)}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Number of Guests</Text>
          <View style={styles.guestSelector}>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => adjustGuests(-1)}
              disabled={guests <= 1}
            >
              <Ionicons name="remove" size={20} color={guests <= 1 ? "#ccc" : "#4A5D23"} />
            </TouchableOpacity>
            <Text style={styles.guestCount}>{guests}</Text>
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => adjustGuests(1)}
              disabled={guests >= 10}
            >
              <Ionicons name="add" size={20} color={guests >= 10 ? "#ccc" : "#4A5D23"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Any special requirements or requests..."
            value={specialRequests}
            onChangeText={setSpecialRequests}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duration:</Text>
            <Text style={styles.summaryValue}>{calculateNights()} night{calculateNights() !== 1 ? 's' : ''}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Rate per night:</Text>
            <Text style={styles.summaryValue}>${campground.price}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Guests:</Text>
            <Text style={styles.summaryValue}>{guests}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${calculateTotal()}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.bookButton, submitting && styles.bookButtonDisabled]}
          onPress={handleBooking}
          disabled={submitting}
        >
          <Text style={styles.bookButtonText}>
            {submitting ? 'Processing...' : `Book for $${calculateTotal()}`}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {showCheckInPicker && (
        <DateTimePicker
          value={checkInDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleCheckInDateChange}
          minimumDate={new Date()}
        />
      )}

      {showCheckOutPicker && (
        <DateTimePicker
          value={checkOutDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleCheckOutDateChange}
          minimumDate={new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)}
        />
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
  campgroundInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  campgroundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  campgroundLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  pricePerNight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5D23',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  guestSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  guestCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
  },
  summarySection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A5D23',
  },
  bookButton: {
    backgroundColor: '#4A5D23',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 
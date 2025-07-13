// Track if Intercom has been booted
let isBooted = false;

// Get Intercom app ID from environment variables
const INTERCOM_APP_ID = process.env.REACT_APP_INTERCOM_APP_ID || 'hqd6b4qh';

// Booking-related types for better type safety
interface BookingStats {
  total_bookings: number;
  total_booking_value: number;
  confirmed_bookings: number;
  expired_bookings: number;
  cancelled_bookings: number;
  average_booking_value: number;
  average_stay_duration: number;
  last_booking_date?: number;
  favorite_campground_location?: string;
  total_nights_booked: number;
  booking_frequency?: 'frequent' | 'occasional' | 'new';
}

// Calculate booking statistics from user's booking data
const calculateBookingStats = (bookings: any[]): BookingStats => {
  if (!bookings || bookings.length === 0) {
    return {
      total_bookings: 0,
      total_booking_value: 0,
      confirmed_bookings: 0,
      expired_bookings: 0,
      cancelled_bookings: 0,
      average_booking_value: 0,
      average_stay_duration: 0,
      total_nights_booked: 0,
      booking_frequency: 'new'
    };
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const expiredBookings = bookings.filter(b => b.status === 'expired');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  const totalValue = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
  const totalNights = bookings.reduce((sum, booking) => sum + (booking.days || 0), 0);
  
  // Find most frequent location
  const locationCounts = bookings.reduce((acc, booking) => {
    const location = booking.campground?.location;
    if (location) {
      acc[location] = (acc[location] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const favoriteLocation = Object.keys(locationCounts).length > 0 
    ? Object.entries(locationCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0][0] 
    : undefined;

  // Determine booking frequency
  let frequency: 'frequent' | 'occasional' | 'new' = 'new';
  if (bookings.length >= 10) frequency = 'frequent';
  else if (bookings.length >= 3) frequency = 'occasional';

  // Get last booking date
  const lastBooking = bookings
    .filter(b => b.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

  return {
    total_bookings: bookings.length,
    total_booking_value: Math.round(totalValue * 100) / 100,
    confirmed_bookings: confirmedBookings.length,
    expired_bookings: expiredBookings.length,
    cancelled_bookings: cancelledBookings.length,
    average_booking_value: bookings.length > 0 ? Math.round((totalValue / bookings.length) * 100) / 100 : 0,
    average_stay_duration: bookings.length > 0 ? Math.round((totalNights / bookings.length) * 10) / 10 : 0,
    total_nights_booked: totalNights,
    last_booking_date: lastBooking ? Math.floor(new Date(lastBooking.createdAt).getTime() / 1000) : undefined,
    favorite_campground_location: favoriteLocation,
    booking_frequency: frequency
  };
};

// Update Intercom with user data including booking information
export const updateIntercomUser = (user: any, bookings?: any[]) => {
  if (!user) {
    // If no user, shutdown Intercom session and reset boot state
    window.Intercom && window.Intercom('shutdown');
    // Boot Intercom for logged-out state
    window.Intercom && window.Intercom('boot', {
      app_id: INTERCOM_APP_ID
    });
    isBooted = false;
    return;
  }

  // Calculate booking statistics if bookings are provided
  const bookingStats = bookings ? calculateBookingStats(bookings) : {};

  const userData = {
    app_id: INTERCOM_APP_ID,
    name: user.username || user.name,
    email: user.email,
    user_id: user.id, // Use only the user ID for consistent user identification in Intercom
    created_at: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000),
    role: user.role || 'user',
    website: user.website || 'thecampground.vercel.app',
    
    // User stats from profile
    ...(user.stats && {
      campgrounds_created: user.stats.campgrounds,
      reviews_written: user.stats.reviews,
      profile_bookings_count: user.stats.bookings
    }),

    // Booking statistics
    ...bookingStats,

    // Activity tracking
    ...(user.last_viewed_campground && {
      last_viewed_campground: user.last_viewed_campground,
      last_viewed_campground_id: user.last_viewed_campground_id,
      last_viewed_campground_at: user.last_viewed_campground_at
    }),

    // Include additional user properties if they exist
    ...(user.campground_views && { campground_views: user.campground_views }),
    ...(user.last_login_at && { last_login_at: user.last_login_at }),
    ...(user.signup_source && { signup_source: user.signup_source })
  };

  if (!isBooted) {
    // First time - boot with user data
    window.Intercom && window.Intercom('boot', userData);
    isBooted = true;
  } else {
    // Subsequent updates - use update
    window.Intercom && window.Intercom('update', userData);
  }
};

// Track booking events
export const trackBookingEvent = (eventName: string, bookingData: any, userData?: any) => {
  if (!window.Intercom) return;

  const eventData = {
    event_name: eventName,
    created_at: Math.floor(Date.now() / 1000),
    metadata: {
      booking_id: bookingData._id || bookingData.id,
      campground_id: bookingData.campground?._id || bookingData.campground?.id,
      campground_name: bookingData.campground?.title,
      campground_location: bookingData.campground?.location,
      booking_value: bookingData.totalPrice,
      stay_duration: bookingData.days,
      check_in_date: bookingData.checkInDate,
      check_out_date: bookingData.checkOutDate,
      booking_status: bookingData.status,
      price_per_night: bookingData.campground?.price,
      ...(userData && { user_id: userData.id })
    }
  };

  // Track the event
  window.Intercom && window.Intercom('trackEvent', eventName, eventData.metadata);
  
  console.log(`📊 Tracked Intercom event: ${eventName}`, eventData);
};

// Predefined booking events
export const bookingEvents = {
  BOOKING_CREATED: 'booking_created',
  BOOKING_VIEWED: 'booking_viewed',
  BOOKING_CANCELLED: 'booking_cancelled',
  BOOKING_EXPIRED: 'booking_expired',
  CAMPGROUND_VIEWED: 'campground_viewed',
  CAMPGROUND_FAVORITED: 'campground_favorited',
  BOOKING_SEARCH: 'booking_search',
  PAYMENT_COMPLETED: 'payment_completed'
};

// Helper functions for common booking events
export const trackBookingCreated = (booking: any, user?: any) => {
  trackBookingEvent(bookingEvents.BOOKING_CREATED, booking, user);
};

export const trackBookingCancelled = (booking: any, user?: any) => {
  trackBookingEvent(bookingEvents.BOOKING_CANCELLED, booking, user);
};

export const trackCampgroundViewed = (campground: any, user?: any) => {
  if (!window.Intercom) return;
  
  const metadata = {
    campground_id: campground._id || campground.id,
    campground_name: campground.title,
    campground_location: campground.location,
    campground_price: campground.price,
    campground_capacity: campground.capacity,
    available_spots: campground.availableSpots || (campground.capacity - campground.peopleBooked),
    booking_percentage: campground.bookingPercentage,
    average_rating: campground.averageRating,
    total_reviews: campground.totalReviews,
    ...(user && { user_id: user.id })
  };

  window.Intercom && window.Intercom('trackEvent', bookingEvents.CAMPGROUND_VIEWED, metadata);
};

// Enhanced user update with booking data
export const updateIntercomWithBookings = async (user: any) => {
  try {
    // Import bookingAPI dynamically to avoid circular imports
    const { bookingAPI } = await import('./api');
    
    // Fetch user's bookings
    const bookingsResponse = await bookingAPI.getUserBookings();
    
    if (bookingsResponse.success && bookingsResponse.data) {
      const bookings = bookingsResponse.data.bookings;
      updateIntercomUser(user, bookings);
    } else {
      updateIntercomUser(user);
    }
  } catch (error) {
    console.warn('Failed to fetch bookings for Intercom update:', error);
    updateIntercomUser(user);
  }
};

// Update Intercom when URL changes
export const updateIntercomPage = () => {
  if (window.Intercom) {
    window.Intercom('update', {
      last_request_at: Math.floor(Date.now() / 1000)
    });
  }
};

// Manual show function
export const showIntercom = () => {
  if (window.Intercom) {
    window.Intercom('show');
  }
};

// Manual hide function
export const hideIntercom = () => {
  if (window.Intercom) {
    window.Intercom('hide');
  }
};

// Shutdown Intercom (useful for logout)
export const shutdownIntercom = () => {
  if (window.Intercom) {
    window.Intercom('shutdown');
    
    // Reinitialize Intercom for anonymous visitors after logout
    setTimeout(() => {
      window.Intercom('boot', {
        app_id: INTERCOM_APP_ID
      });
    }, 100); // Small delay to ensure shutdown completes
    
    isBooted = false;
  }
}; 
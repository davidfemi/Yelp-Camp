# Intercom Booking Integration Guide

This document explains how booking information is integrated with Intercom for enhanced customer support and analytics.

## Overview

The YelpCamp application now automatically syncs comprehensive booking data with Intercom, providing your support team with detailed user context and enabling powerful customer segmentation.

## Features

### 1. User Attributes
When users log in or their data is updated, the following booking-related attributes are automatically sent to Intercom:

- `total_bookings` - Total number of bookings made
- `total_booking_value` - Total amount spent on bookings
- `confirmed_bookings` - Number of active confirmed bookings
- `expired_bookings` - Number of expired bookings
- `cancelled_bookings` - Number of cancelled bookings
- `average_booking_value` - Average spend per booking
- `average_stay_duration` - Average number of nights per booking
- `total_nights_booked` - Total nights across all bookings
- `last_booking_date` - Timestamp of most recent booking
- `favorite_campground_location` - Most frequently booked location
- `booking_frequency` - User segment: 'frequent', 'occasional', or 'new'

### 2. Event Tracking
The following events are automatically tracked:

#### Frontend Events (Real-time)
- `booking_created` - When a user successfully creates a booking
- `campground_viewed` - When a user views a campground detail page
- `booking_viewed` - When a user views their booking history

#### Backend Events (Automated)
- `booking_expired` - When a booking expires and spots are freed up

### 3. User Segmentation
Users are automatically categorized based on booking behavior:
- **Frequent Users**: 10+ bookings
- **Occasional Users**: 3-9 bookings  
- **New Users**: 0-2 bookings

## Setup Instructions

### Frontend Configuration

The frontend integration is already configured. Make sure you have your Intercom App ID set:

```bash
# In yelpcamp-frontend/.env
REACT_APP_INTERCOM_APP_ID=your_intercom_app_id
```

### Backend Configuration (Optional)

For server-side event tracking (like booking expirations), add your Intercom Access Token:

```bash
# In yelpcamp-backend/.env
INTERCOM_ACCESS_TOKEN=your_intercom_access_token
```

To get your Intercom Access Token:
1. Go to Intercom Developer Hub
2. Create or select your app
3. Navigate to "Authentication" 
4. Copy your Access Token

## Data Flow

### 1. User Authentication
When users log in or register:
```javascript
// AuthContext automatically calls:
updateIntercomWithBookings(user)
```

### 2. Booking Creation
When a booking is created:
```javascript
// CampgroundDetail automatically calls:
trackBookingCreated(booking, user)
```

### 3. Profile Updates
When users visit their profile:
```javascript
// UserProfile automatically calls:
updateIntercomUser(userProfile, bookings)
```

### 4. Booking Expiration
The backend cleanup service automatically tracks expired bookings:
```javascript
// BookingCleanupService tracks:
trackIntercomEvent(userId, 'booking_expired', metadata)
```

## Intercom Dashboard Usage

With this integration, you can now:

### In User Profiles
- See total booking value and history
- Identify high-value customers
- View favorite camping locations
- See booking patterns and frequency

### In Conversations
- Automatically see user's booking context
- Quick access to booking history
- Understand user's camping preferences

### For Segmentation
Create user segments based on:
- Booking frequency (`booking_frequency = 'frequent'`)
- Total spend (`total_booking_value > 500`)
- Recent activity (`last_booking_date > timestamp`)
- Favorite locations (`favorite_campground_location contains 'California'`)

### For Automation
Set up automated messages for:
- Users with expired bookings
- High-value customers
- Users who haven't booked in a while
- First-time bookers

## Event Metadata

### Booking Created Event
```javascript
{
  booking_id: "booking_id",
  campground_id: "campground_id", 
  campground_name: "Campground Name",
  campground_location: "Location",
  booking_value: 150.00,
  stay_duration: 3,
  check_in_date: "2024-07-01",
  check_out_date: "2024-07-04",
  booking_status: "confirmed",
  price_per_night: 50.00
}
```

### Campground Viewed Event
```javascript
{
  campground_id: "campground_id",
  campground_name: "Campground Name", 
  campground_location: "Location",
  campground_price: 50.00,
  available_spots: 25,
  booking_percentage: 75,
  average_rating: 4.5,
  total_reviews: 42
}
```

## Troubleshooting

### Events Not Appearing
1. Check that your Intercom App ID is correctly set
2. Verify the Intercom widget is loading on your site
3. Check browser console for any JavaScript errors

### User Attributes Not Updating
1. Ensure users are properly authenticated
2. Check that booking data is being fetched successfully
3. Verify the `updateIntercomWithBookings` function is being called

### Server-Side Events Not Working
1. Verify `INTERCOM_ACCESS_TOKEN` is set in backend environment
2. Check backend logs for Intercom API errors
3. Ensure the cleanup service is running properly

## Privacy Considerations

- Only authenticated users have their data sent to Intercom
- All data sent is already accessible to the user in their profile
- No sensitive payment information is transmitted
- Users can opt out of tracking by disabling cookies

## Development Testing

To test the integration in development:

1. Create test bookings in your local environment
2. Open browser developer tools and check the Network tab for Intercom calls
3. Verify events appear in your Intercom development workspace
4. Test user attribute updates by logging in/out

## Best Practices

1. **Monitor Data Quality**: Regularly check that booking statistics are accurate
2. **Segment Strategy**: Use booking data to create meaningful user segments
3. **Automation Setup**: Create helpful automated messages for different user types
4. **Privacy Compliance**: Ensure data handling complies with GDPR/CCPA if applicable

This integration provides powerful insights into user behavior and enables your support team to provide personalized, context-aware assistance to your camping community! 
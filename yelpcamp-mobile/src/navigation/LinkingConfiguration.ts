import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { RootStackParamList } from '../types';

const prefix = Linking.createURL('/');

export const LinkingConfiguration: LinkingOptions<RootStackParamList> = {
  prefixes: [
    prefix,
    'campgrounds://',
    'com.campgrounds.mobile://',
    'https://thecampgrounds.com',
    'https://www.thecampgrounds.com',
  ],
  config: {
    screens: {
      // Authentication screens
      Login: 'login',
      Register: 'register',
      
      // Main tab navigation
      MainTabs: {
        screens: {
          HomeTab: {
            path: 'home',
            screens: {
              Home: '',
            },
          },
          ExploreTab: {
            path: 'explore',
            screens: {
              Explore: '',
            },
          },
          ShopTab: {
            path: 'shop',
            screens: {
              Shop: '',
            },
          },
          ProfileTab: {
            path: 'profile',
            screens: {
              Profile: '',
            },
          },
        },
      },
      
      // Campground screens
      CampgroundDetail: {
        path: 'campground/:campgroundId',
        parse: {
          campgroundId: (campgroundId: string) => campgroundId,
        },
      },
      
      // Booking screens
      BookingForm: {
        path: 'book/:campgroundId',
        parse: {
          campgroundId: (campgroundId: string) => campgroundId,
        },
      },
      Bookings: 'bookings',
      BookingDetail: {
        path: 'booking/:bookingId',
        parse: {
          bookingId: (bookingId: string) => bookingId,
        },
      },
      
      // Shop screens
      ProductDetail: {
        path: 'product/:productId',
        parse: {
          productId: (productId: string) => productId,
        },
      },
      Cart: 'cart',
      Checkout: 'checkout',
      
      // Order screens
      Orders: 'orders',
      OrderDetail: {
        path: 'order/:orderId',
        parse: {
          orderId: (orderId: string) => orderId,
        },
      },
      
      // Profile screens
      EditProfile: 'profile/edit',
    },
  },
  
  // Custom function to handle deep links that don't match any screen
  getInitialURL: async () => {
    // First, you may want to do the default deep link handling
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();
    if (url != null) {
      return url;
    }
    
    // Handle other ways your app can be opened (e.g., from a push notification)
    // This is just an example, you'd need to implement actual notification handling
    return null;
  },
  
  // Custom function to subscribe to incoming links
  subscribe: (listener) => {
    const onReceiveURL = ({ url }: { url: string }) => listener(url);
    
    // Listen to incoming links from deep linking
    const subscription = Linking.addEventListener('url', onReceiveURL);
    
    return () => {
      // Clean up the event listeners
      subscription?.remove();
    };
  },
};

// Helper function to create deep links
export const createDeepLink = {
  campground: (campgroundId: string) => `campgrounds://campground/${campgroundId}`,
  product: (productId: string) => `campgrounds://product/${productId}`,
  booking: (bookingId: string) => `campgrounds://booking/${bookingId}`,
  order: (orderId: string) => `campgrounds://order/${orderId}`,
  bookingForm: (campgroundId: string) => `campgrounds://book/${campgroundId}`,
  profile: () => `campgrounds://profile`,
  shop: () => `campgrounds://shop`,
  cart: () => `campgrounds://cart`,
  bookings: () => `campgrounds://bookings`,
  orders: () => `campgrounds://orders`,
};

// Helper function to create universal links
export const createUniversalLink = {
  campground: (campgroundId: string) => `https://thecampgrounds.com/campground/${campgroundId}`,
  product: (productId: string) => `https://thecampgrounds.com/product/${productId}`,
  booking: (bookingId: string) => `https://thecampgrounds.com/booking/${bookingId}`,
  order: (orderId: string) => `https://thecampgrounds.com/order/${orderId}`,
  bookingForm: (campgroundId: string) => `https://thecampgrounds.com/book/${campgroundId}`,
  profile: () => `https://thecampgrounds.com/profile`,
  shop: () => `https://thecampgrounds.com/shop`,
  cart: () => `https://thecampgrounds.com/cart`,
  bookings: () => `https://thecampgrounds.com/bookings`,
  orders: () => `https://thecampgrounds.com/orders`,
}; 
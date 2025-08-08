import { NavigationContainerRef } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';
import { RootStackParamList } from '../types';

// Navigation reference for imperative navigation
let navigationRef: NavigationContainerRef<RootStackParamList> | null = null;

export const setNavigationRef = (ref: NavigationContainerRef<RootStackParamList>) => {
  navigationRef = ref;
};

export const getNavigationRef = () => navigationRef;

// Deep link handler function
export const handleDeepLink = async (url: string): Promise<boolean> => {
  try {
    if (!navigationRef) {
      console.warn('Navigation ref not set, unable to handle deep link:', url);
      return false;
    }

    // Parse the URL
    const parsed = Linking.parse(url);
    const { hostname, path, queryParams } = parsed;

    console.log('Handling deep link:', { url, hostname, path, queryParams });

    // Handle different URL patterns
    if (path) {
      const pathSegments = path.split('/').filter(segment => segment.length > 0);
      
      if (pathSegments.length === 0) {
        // Root path - navigate to home
        navigationRef.navigate('MainTabs');
        return true;
      }

      const [firstSegment, secondSegment] = pathSegments;

      switch (firstSegment) {
        case 'campground':
          if (secondSegment) {
            navigationRef.navigate('CampgroundDetail', { campgroundId: secondSegment });
            return true;
          }
          break;

        case 'product':
          if (secondSegment) {
            navigationRef.navigate('ProductDetail', { productId: secondSegment });
            return true;
          }
          break;

        case 'book':
          if (secondSegment) {
            navigationRef.navigate('BookingForm', { campgroundId: secondSegment });
            return true;
          }
          break;

        case 'booking':
          if (secondSegment) {
            navigationRef.navigate('BookingDetail', { bookingId: secondSegment });
            return true;
          } else {
            navigationRef.navigate('Bookings');
            return true;
          }
          break;

        case 'order':
          if (secondSegment) {
            navigationRef.navigate('OrderDetail', { orderId: secondSegment });
            return true;
          }
          break;

        case 'orders':
          navigationRef.navigate('Orders');
          return true;

        case 'bookings':
          navigationRef.navigate('Bookings');
          return true;

        case 'cart':
          navigationRef.navigate('Cart');
          return true;

        case 'checkout':
          navigationRef.navigate('Checkout');
          return true;

        case 'shop':
          navigationRef.navigate('MainTabs');
          return true;

        case 'explore':
          navigationRef.navigate('MainTabs');
          return true;

        case 'profile':
          if (pathSegments[1] === 'edit') {
            navigationRef.navigate('EditProfile');
          } else {
            navigationRef.navigate('MainTabs');
          }
          return true;

        case 'home':
          navigationRef.navigate('MainTabs');
          return true;

        case 'login':
          navigationRef.navigate('Login');
          return true;

        case 'register':
          navigationRef.navigate('Register');
          return true;

        default:
          console.warn('Unknown deep link path:', firstSegment);
          return false;
      }
    }

    return false;
  } catch (error) {
    console.error('Error handling deep link:', error);
    return false;
  }
};

// Function to handle failed deep links
export const handleDeepLinkError = (url: string, error?: any) => {
  console.error('Failed to handle deep link:', url, error);
  
  Alert.alert(
    'Link Error',
    'Sorry, we couldn\'t open that link. Please try again or contact support if the problem persists.',
    [{ text: 'OK', style: 'default' }]
  );
};

// Function to validate if a URL is a supported deep link
export const isValidDeepLink = (url: string): boolean => {
  try {
    const parsed = Linking.parse(url);
    const { hostname, path } = parsed;
    
    // Check for supported schemes and hosts
    const supportedHosts = [
      'thecampgrounds.com',
      'www.thecampgrounds.com',
    ];
    
    const supportedSchemes = [
      'campgrounds',
      'com.campgrounds.mobile',
    ];

    // Check if it's a universal link
    if (hostname && supportedHosts.includes(hostname)) {
      return true;
    }

    // Check if it's a custom scheme (hostname will be null for custom schemes)
    if (!hostname && url.startsWith('campgrounds://')) {
      return true;
    }

    if (!hostname && url.startsWith('com.campgrounds.mobile://')) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error validating deep link:', error);
    return false;
  }
};

// Function to get the current route name
export const getCurrentRouteName = (): string | undefined => {
  if (!navigationRef) {
    return undefined;
  }
  
  return navigationRef.getCurrentRoute()?.name;
};

// Function to share a deep link
export const shareDeepLink = async (url: string) => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      throw new Error('Cannot open URL');
    }
  } catch (error) {
    console.error('Error sharing deep link:', error);
    Alert.alert(
      'Share Error',
      'Unable to share this link. Please try again later.',
      [{ text: 'OK', style: 'default' }]
    );
  }
};

// Function to handle external URLs (like opening web browser)
export const openExternalURL = async (url: string) => {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(
        'Cannot Open Link',
        'This link cannot be opened on your device.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  } catch (error) {
    console.error('Error opening external URL:', error);
    Alert.alert(
      'Error',
      'Unable to open this link. Please try again later.',
      [{ text: 'OK', style: 'default' }]
    );
  }
}; 
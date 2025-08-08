import { Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { createDeepLink, createUniversalLink } from '../navigation/LinkingConfiguration';
import { handleDeepLink, isValidDeepLink } from './deepLinkUtils';

// Test cases for deep linking
export const testDeepLinks = async () => {
  const testCases = [
    // Custom scheme tests
    'campgrounds://campground/64f1a2b3c4d5e6f7g8h9i0j1',
    'campgrounds://product/64f1a2b3c4d5e6f7g8h9i0j2',
    'campgrounds://book/64f1a2b3c4d5e6f7g8h9i0j1',
    'campgrounds://booking/64f1a2b3c4d5e6f7g8h9i0j3',
    'campgrounds://bookings',
    'campgrounds://cart',
    'campgrounds://shop',
    'campgrounds://profile',
    'campgrounds://profile/edit',
    'campgrounds://orders',
    'campgrounds://order/64f1a2b3c4d5e6f7g8h9i0j4',
    
    // Universal link tests
    'https://thecampgrounds.com/campground/64f1a2b3c4d5e6f7g8h9i0j1',
    'https://thecampgrounds.com/product/64f1a2b3c4d5e6f7g8h9i0j2',
    'https://thecampgrounds.com/shop',
    'https://www.thecampgrounds.com/profile',
    
    // Invalid tests
    'invalid://test',
    'https://example.com/test',
  ];

  console.log('🔗 Testing Deep Link Functionality...\n');

  for (const testUrl of testCases) {
    const isValid = isValidDeepLink(testUrl);
    console.log(`Testing: ${testUrl}`);
    console.log(`Valid: ${isValid ? '✅' : '❌'}`);
    
    if (isValid) {
      const handled = await handleDeepLink(testUrl);
      console.log(`Handled: ${handled ? '✅' : '❌'}`);
    }
    console.log('---');
  }
};

// Function to test specific campground deep link
export const testCampgroundDeepLink = (campgroundId: string = '64f1a2b3c4d5e6f7g8h9i0j1') => {
  const customScheme = createDeepLink.campground(campgroundId);
  const universalLink = createUniversalLink.campground(campgroundId);
  
  Alert.alert(
    'Campground Deep Links',
    `Custom Scheme: ${customScheme}\n\nUniversal Link: ${universalLink}`,
    [
      {
        text: 'Test Custom Scheme',
        onPress: () => handleDeepLink(customScheme),
      },
      {
        text: 'Test Universal Link',
        onPress: () => handleDeepLink(universalLink),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

// Function to test product deep link
export const testProductDeepLink = (productId: string = '64f1a2b3c4d5e6f7g8h9i0j2') => {
  const customScheme = createDeepLink.product(productId);
  const universalLink = createUniversalLink.product(productId);
  
  Alert.alert(
    'Product Deep Links',
    `Custom Scheme: ${customScheme}\n\nUniversal Link: ${universalLink}`,
    [
      {
        text: 'Test Custom Scheme',
        onPress: () => handleDeepLink(customScheme),
      },
      {
        text: 'Test Universal Link',
        onPress: () => handleDeepLink(universalLink),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

// Function to test booking flow deep links
export const testBookingDeepLinks = () => {
  const campgroundId = '64f1a2b3c4d5e6f7g8h9i0j1';
  const bookingId = '64f1a2b3c4d5e6f7g8h9i0j3';
  
  Alert.alert(
    'Booking Deep Links',
    'Choose a booking flow to test:',
    [
      {
        text: 'Book Campground',
        onPress: () => handleDeepLink(createDeepLink.bookingForm(campgroundId)),
      },
      {
        text: 'View Booking',
        onPress: () => handleDeepLink(createDeepLink.booking(bookingId)),
      },
      {
        text: 'All Bookings',
        onPress: () => handleDeepLink(createDeepLink.bookings()),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

// Function to test shop deep links
export const testShopDeepLinks = () => {
  const productId = '64f1a2b3c4d5e6f7g8h9i0j2';
  
  Alert.alert(
    'Shop Deep Links',
    'Choose a shop flow to test:',
    [
      {
        text: 'Shop Home',
        onPress: () => handleDeepLink(createDeepLink.shop()),
      },
      {
        text: 'Product Detail',
        onPress: () => handleDeepLink(createDeepLink.product(productId)),
      },
      {
        text: 'Cart',
        onPress: () => handleDeepLink(createDeepLink.cart()),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

// Function to test profile deep links
export const testProfileDeepLinks = () => {
  Alert.alert(
    'Profile Deep Links',
    'Choose a profile flow to test:',
    [
      {
        text: 'Profile Home',
        onPress: () => handleDeepLink(createDeepLink.profile()),
      },
      {
        text: 'Edit Profile',
        onPress: () => handleDeepLink('campgrounds://profile/edit'),
      },
      {
        text: 'Orders',
        onPress: () => handleDeepLink(createDeepLink.orders()),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

// Function to demonstrate sharing a deep link
export const demonstrateSharing = () => {
  const campgroundLink = createUniversalLink.campground('64f1a2b3c4d5e6f7g8h9i0j1');
  
  Alert.alert(
    'Share Deep Link',
    `This would share: ${campgroundLink}`,
    [
      {
        text: 'Copy Link',
        onPress: () => {
          // In a real app, you'd use a clipboard library here
          console.log('Copied to clipboard:', campgroundLink);
          Alert.alert('Success', 'Link copied to clipboard!');
        },
      },
      {
        text: 'Open Link',
        onPress: () => Linking.openURL(campgroundLink),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
};

// Function to create a comprehensive test menu
export const showDeepLinkTestMenu = () => {
  Alert.alert(
    'Deep Link Testing',
    'Choose a category to test:',
    [
      {
        text: 'Campgrounds',
        onPress: testCampgroundDeepLink,
      },
      {
        text: 'Products',
        onPress: testProductDeepLink,
      },
      {
        text: 'Bookings',
        onPress: testBookingDeepLinks,
      },
      {
        text: 'Shop',
        onPress: testShopDeepLinks,
      },
      {
        text: 'Profile',
        onPress: testProfileDeepLinks,
      },
      {
        text: 'Share Demo',
        onPress: demonstrateSharing,
      },
      {
        text: 'Run All Tests',
        onPress: testDeepLinks,
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]
  );
}; 
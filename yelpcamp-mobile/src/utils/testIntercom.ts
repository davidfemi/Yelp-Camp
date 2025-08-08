import { Alert } from 'react-native';
import { 
  isIntercomAvailable, 
  logIntercomEvent, 
  initializeIntercom 
} from './intercomUtils';

// Test Intercom functionality
export const testIntercomSetup = async () => {
  try {
    console.log('🔧 Testing Intercom Setup...');
    
    // Check if Intercom is available
    const isAvailable = isIntercomAvailable();
    console.log(`Intercom Available: ${isAvailable ? '✅' : '❌'}`);
    
    if (!isAvailable) {
      Alert.alert(
        'Intercom Test',
        'Intercom is not available on this device/platform',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    // Test event logging
    const eventSuccess = await logIntercomEvent('test_event', {
      test_data: 'hello from test',
      timestamp: Date.now()
    });
    
    console.log(`Event Logging: ${eventSuccess ? '✅' : '❌'}`);
    
    Alert.alert(
      'Intercom Test Results',
      `Available: ${isAvailable ? 'YES' : 'NO'}\nEvent Logging: ${eventSuccess ? 'SUCCESS' : 'FAILED'}`,
      [{ text: 'OK' }]
    );
    
    return isAvailable && eventSuccess;
  } catch (error) {
    console.error('Intercom test failed:', error);
    Alert.alert(
      'Intercom Test Error',
      `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      [{ text: 'OK' }]
    );
    return false;
  }
};

// Test Intercom initialization with different scenarios
export const testIntercomInitialization = async () => {
  console.log('🔄 Testing Intercom Initialization...');
  
  try {
    // Test unidentified user initialization
    console.log('Testing unidentified user...');
    const unidentifiedSuccess = await initializeIntercom();
    console.log(`Unidentified User Init: ${unidentifiedSuccess ? '✅' : '❌'}`);
    
    // Test identified user initialization
    console.log('Testing identified user...');
    const identifiedSuccess = await initializeIntercom({
      userId: 'test-user-123',
      email: 'test@example.com',
      name: 'Test User'
    });
    console.log(`Identified User Init: ${identifiedSuccess ? '✅' : '❌'}`);
    
    Alert.alert(
      'Initialization Test',
      `Unidentified: ${unidentifiedSuccess ? 'SUCCESS' : 'FAILED'}\nIdentified: ${identifiedSuccess ? 'SUCCESS' : 'FAILED'}`,
      [{ text: 'OK' }]
    );
    
    return unidentifiedSuccess && identifiedSuccess;
  } catch (error) {
    console.error('Initialization test failed:', error);
    Alert.alert(
      'Initialization Error',
      `Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      [{ text: 'OK' }]
    );
    return false;
  }
};

// Quick debug info
export const getIntercomDebugInfo = () => {
  const info = {
    isAvailable: isIntercomAvailable(),
    platform: require('react-native').Platform.OS,
    timestamp: new Date().toISOString()
  };
  
  console.log('Intercom Debug Info:', info);
  return info;
}; 
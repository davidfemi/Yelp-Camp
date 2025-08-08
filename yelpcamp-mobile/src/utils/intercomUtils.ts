import { Platform } from 'react-native';

// Lazy import Intercom to prevent early native module access
let IntercomModule: any = null;
let isIntercomLoaded = false;

// Safe Intercom module loader with enhanced native bridge checks
const loadIntercomSafely = (): boolean => {
  if (isIntercomLoaded) {
    return IntercomModule !== null;
  }

  try {
    // Only attempt to load on supported platforms
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      console.warn('Intercom not supported on this platform');
      isIntercomLoaded = true;
      return false;
    }

    // Check if React Native bridge is ready
    const ReactNative = require('react-native');
    if (!ReactNative.NativeModules) {
      console.warn('React Native bridge not ready yet');
      return false; // Don't mark as loaded, try again later
    }

    // Additional safety check - ensure we're not in the middle of bridge initialization
    if (typeof ReactNative.NativeModules === 'object' && Object.keys(ReactNative.NativeModules).length === 0) {
      console.warn('Native modules still initializing');
      return false; // Don't mark as loaded, try again later
    }

    // Specific check for Intercom in NativeModules
    if (!ReactNative.NativeModules.IntercomWrapper && !ReactNative.NativeModules.IntercomModule) {
      console.warn('Intercom native module not found in bridge');
      return false; // Don't mark as loaded, try again later
    }

    // Try to access Intercom safely
    const IntercomReactNative = require('@intercom/intercom-react-native');
    
    // Check if the module was loaded successfully
    if (!IntercomReactNative || (!IntercomReactNative.default && !IntercomReactNative.Intercom)) {
      console.warn('Intercom module not available in package');
      isIntercomLoaded = true;
      return false;
    }

    // Get the actual Intercom module
    IntercomModule = IntercomReactNative.default || IntercomReactNative.Intercom || IntercomReactNative;
    
    // Verify essential properties exist and are functions
    if (IntercomModule && 
        typeof IntercomModule.logEvent === 'function' &&
        typeof IntercomModule.loginUserWithUserAttributes === 'function') {
      isIntercomLoaded = true;
      console.log('Intercom module loaded successfully');
      return true;
    } else {
      console.warn('Intercom module loaded but missing expected methods');
      IntercomModule = null;
      isIntercomLoaded = true;
      return false;
    }
  } catch (error) {
    console.warn('Failed to load Intercom module:', error);
    IntercomModule = null;
    
    // If this is a native module access error, don't mark as loaded so we can retry
    if (error && typeof error === 'object' && 'message' in error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('UNREAD_COUNT_CHANGE_NOTIFICATION') || 
          errorMessage.includes('Native module') ||
          errorMessage.includes('bridge')) {
        console.warn('Native bridge not ready, will retry later');
        return false; // Don't mark as loaded, allow retry
      }
    }
    
    isIntercomLoaded = true;
    return false;
  }
};

// Safe wrapper for Intercom methods to prevent runtime errors
export const safeIntercomCall = async (
  method: string,
  ...args: any[]
): Promise<boolean> => {
  try {
    // Load Intercom module safely first
    if (!loadIntercomSafely()) {
      return false;
    }

    // Double-check the method exists
    if (!IntercomModule || typeof IntercomModule[method] !== 'function') {
      console.warn(`Intercom method '${method}' not available`);
      return false;
    }

    // Call the Intercom method with provided arguments
    await IntercomModule[method](...args);
    return true;
  } catch (error) {
    console.warn(`Intercom ${method} failed:`, error);
    return false;
  }
};

// Safe event logging
export const logIntercomEvent = async (
  eventName: string,
  eventData?: Record<string, any>
): Promise<boolean> => {
  return safeIntercomCall('logEvent', eventName, eventData);
};

// Safe user attribute updates
export const updateIntercomUser = async (
  userAttributes: Record<string, any>
): Promise<boolean> => {
  return safeIntercomCall('updateUser', userAttributes);
};

// Safe launcher visibility setting
export const setIntercomLauncherVisibility = async (
  visibility: any
): Promise<boolean> => {
  return safeIntercomCall('setLauncherVisibility', visibility);
};

// Safe user login
export const loginIntercomUser = async (
  userAttributes: Record<string, any>
): Promise<boolean> => {
  return safeIntercomCall('loginUserWithUserAttributes', userAttributes);
};

// Safe unidentified user login
export const loginIntercomUnidentifiedUser = async (): Promise<boolean> => {
  return safeIntercomCall('loginUnidentifiedUser');
};

// Safe logout
export const logoutIntercom = async (): Promise<boolean> => {
  return safeIntercomCall('logout');
};

// Check if Intercom is available and initialized
export const isIntercomAvailable = (): boolean => {
  return loadIntercomSafely();
};

// Initialize Intercom with comprehensive error handling and retry logic
export const initializeIntercom = async (
  userAttributes?: Record<string, any>,
  maxRetries: number = 5
): Promise<boolean> => {
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`Starting Intercom initialization attempt ${retryCount + 1}/${maxRetries}...`);
      
      // Progressive delay - longer each retry
      const delay = 3000 + (retryCount * 2000); // 3s, 5s, 7s, 9s, 11s
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Check if Intercom can be loaded
      if (!loadIntercomSafely()) {
        if (retryCount === maxRetries - 1) {
          console.warn('Intercom not available after all retries, skipping initialization');
          return false;
        } else {
          console.log(`Intercom not ready yet, retrying in ${delay}ms...`);
          retryCount++;
          continue;
        }
      }

      // Safely logout first
      await logoutIntercom();
      
      if (userAttributes) {
        // Login with user attributes
        const success = await loginIntercomUser(userAttributes);
        if (success) {
          console.log('Intercom user login successful');
        }
      } else {
        // Login unidentified user
        const success = await loginIntercomUnidentifiedUser();
        if (success) {
          console.log('Intercom unidentified login successful');
        }
      }
      
      // Set launcher visibility - try to require it safely
      try {
        const IntercomReactNative = require('@intercom/intercom-react-native');
        const Visibility = IntercomReactNative.Visibility || IntercomReactNative.default?.Visibility;
        if (Visibility) {
          await setIntercomLauncherVisibility(Visibility.VISIBLE);
        }
      } catch (visibilityError) {
        console.warn('Could not set launcher visibility:', visibilityError);
        // Don't fail the whole initialization for this
      }
      
      console.log('Intercom initialization completed successfully');
      return true;
      
    } catch (error) {
      console.error(`Intercom initialization attempt ${retryCount + 1} failed:`, error);
      
      // Check if this is a native bridge error that we should retry
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as Error).message;
        if (errorMessage.includes('UNREAD_COUNT_CHANGE_NOTIFICATION') || 
            errorMessage.includes('Native module') ||
            errorMessage.includes('bridge') ||
            errorMessage.includes('null')) {
          
          if (retryCount < maxRetries - 1) {
            console.log('Native bridge error detected, will retry...');
            retryCount++;
            continue;
          } else {
            console.error('Native bridge still not ready after all retries');
            return false;
          }
        }
      }
      
      // For other errors, don't retry
      console.error('Non-retryable error during Intercom initialization');
      return false;
    }
  }
  
  console.error('Intercom initialization failed after all retries');
  return false;
}; 
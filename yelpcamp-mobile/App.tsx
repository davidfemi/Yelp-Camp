import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import { 
  initializeIntercom, 
  isIntercomAvailable,
  logoutIntercom 
} from './src/utils/intercomUtils';

function AppContent() {
  const { user } = useAuth();
  const [intercomInitialized, setIntercomInitialized] = useState(false);

  useEffect(() => {
    // Initialize Intercom with safe wrappers (handles delays and retries internally)
    const startIntercom = async () => {
      try {
        console.log('Starting Intercom setup...');
        
        // Get user ID with fallback for MongoDB _id
        const userId = user?.id || (user as any)?._id;
        
        let success = false;
        
        if (user && userId) {
          // Login identified user
          success = await initializeIntercom({
            userId: userId,
            email: user.email,
            name: user.username,
            customAttributes: {
              created_at: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000),
            }
          });
        } else {
          // Login unidentified user
          success = await initializeIntercom();
        }
        
        setIntercomInitialized(success);
        
        if (success) {
          console.log('Intercom setup completed successfully');
        } else {
          console.log('Intercom not available (may need development build)');
        }
      } catch (error) {
        console.error('Intercom setup error:', error);
        setIntercomInitialized(false);
      }
    };
    
    startIntercom();
    
    // Cleanup on user change
    return () => {
      if (intercomInitialized) {
        logoutIntercom();
      }
    };
  }, [user]);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" backgroundColor="#4A5D23" />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}

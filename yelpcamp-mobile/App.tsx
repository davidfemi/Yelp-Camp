import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { CartProvider } from './src/contexts/CartContext';
import { ToastProvider } from './src/contexts/ToastContext';
import AppNavigator from './src/navigation/AppNavigator';
import Intercom, { Visibility } from '@intercom/intercom-react-native';

function AppContent() {
  const { user } = useAuth();
  const [isAppReady, setIsAppReady] = useState(false);
  const [intercomInitialized, setIntercomInitialized] = useState(false);

  // Wait for app to be fully ready before initializing Intercom
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 1000); // Delay to ensure native modules are ready

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAppReady) return;

    // Initialize Intercom with direct API calls
    const startIntercom = async () => {
      try {
        console.log('Starting Intercom setup...');
        
        if (user) {
          // Login identified user
          await Intercom.loginUserWithUserAttributes({
            userId: user.id,
            email: user.email,
            name: user.username,
            customAttributes: {
              created_at: user.createdAt ? Math.floor(new Date(user.createdAt).getTime() / 1000) : Math.floor(Date.now() / 1000),
            }
          });
          console.log('Intercom user login successful');
        } else {
          // Login unidentified user
          await Intercom.loginUnidentifiedUser();
          console.log('Intercom unidentified login successful');
        }
        
        // Set launcher visibility
        await Intercom.setLauncherVisibility(Visibility.VISIBLE);
        console.log('Intercom launcher set to visible');
        
        setIntercomInitialized(true);
        console.log('Intercom setup completed successfully');
      } catch (error) {
        console.error('Intercom setup error:', error);
        setIntercomInitialized(false);
        console.warn('Intercom setup failed, but app will continue normally');
      }
    };
    
    startIntercom();
  }, [user, isAppReady]);

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

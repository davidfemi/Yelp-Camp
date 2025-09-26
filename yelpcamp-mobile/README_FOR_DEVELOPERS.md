# CampgroundsMobile - React Native App

⚠️ **IMPORTANT**: This is an Expo Development Build project, NOT Expo Go compatible!

## Prerequisites

- Node.js 18+ and npm
- **For iOS**: Xcode 14+ and iOS Simulator or physical iOS device
- **For Android**: Android Studio and Android emulator or physical Android device
- Expo CLI (`npm install -g @expo/cli`)

## Quick Setup (Recommended)

Run the automated setup script:
```bash
chmod +x setup.sh
./setup.sh
```

## Manual Setup Instructions

### 1. Clone and Install Dependencies
```bash
git clone <repository-url>
cd yelpcamp-mobile
npm install --legacy-peer-deps
```

### 2. Generate Native Projects
```bash
npx expo prebuild --clean
```

### 3. Run the App

**For iOS:**
```bash
npx expo run:ios
```

**For Android:**
```bash
npx expo run:android
```

**For physical device:**
```bash
# iOS
npx expo run:ios --device

# Android
npx expo run:android --device
```

## Why Can't I Use Expo Go?

This project uses native dependencies (Intercom, Google Maps) that require custom native code. You must build and install a development build on your device/simulator.

## API Configuration

The app connects to the backend API. Update the API URL in `src/services/api.ts`:
```typescript
const API_URL = 'https://thecampgrounds.onrender.com';
```

## Intercom Configuration

The Intercom integration is configured in `app.json`:
```json
{
  "plugins": [
    [
      "@intercom/intercom-react-native",
      {
        "appId": "hqd6b4qh",
        "iosApiKey": "ios_sdk-d5d209d7d2a2c501dc9c9e5042f47f9832088f76"
      }
    ]
  ]
}
```

## Google Maps Configuration

The Google Maps API key is configured in `app.json`:
```json
{
  "ios": {
    "config": {
      "googleMapsApiKey": "AIzaSyBQs0jsW14VYtMjYVIyevdoP3jdxHYpshA"
    }
  }
}
```

## Key Features

- **User Authentication**: Login/Register functionality
- **Campground Browsing**: Browse and search campgrounds
- **Booking System**: Book campgrounds with date selection
- **Shopping Cart**: Add products to cart and checkout
- **Order Management**: View order history
- **Interactive Maps**: View campground locations on map
- **Intercom Support**: In-app customer support chat

## Project Structure

```
CampgroundsMobile/
├── App.tsx                 # Main app component
├── src/
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth, Cart, Toast)
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # React Navigation setup
│   ├── screens/           # App screens
│   ├── services/          # API services
│   └── types/             # TypeScript type definitions
├── assets/                # Images and icons
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Common Commands

- `npm start` - Start Metro bundler
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator
- `npx expo start --clear` - Start with cleared cache
- `npx expo prebuild --clean` - Regenerate native projects

## Troubleshooting

### "No development build (com.campgrounds.mobile) for this project is installed"

This error means you're trying to use `expo start` without having the development build installed. You need to:

1. **Build and install the development build first:**
   ```bash
   npx expo run:ios    # for iOS
   npx expo run:android # for Android
   ```

2. **Then you can use the development server:**
   ```bash
   npx expo start --dev-client
   ```

### Other Common Issues

1. **AsyncStorage Error**: Run `npx expo prebuild --clean` and rebuild
2. **Intercom Error**: Ensure you've run prebuild after adding the plugin
3. **Metro Cache Issues**: Run `npx expo start --clear`
4. **Build Errors**: Delete `ios/` and `android/` folders and run `npx expo prebuild --clean`
5. **"Expo Go" doesn't work**: This project requires a development build, not Expo Go

## Testing on Physical Device

1. Connect your iPhone to your Mac
2. Open Xcode and trust your development certificate
3. Run `npx expo run:ios --device`

## Brand Colors

- Primary Green: `#4A5D23`
- White: `#FFFFFF`
- Gray: `#6B7280`

## Support

For issues or questions about the app, please contact the development team. 
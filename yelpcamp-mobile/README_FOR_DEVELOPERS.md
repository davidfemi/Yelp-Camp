# CampgroundsMobile iOS App

## Prerequisites

- Node.js 18+ and npm
- Xcode 14+ (for iOS development)
- iOS Simulator or physical iOS device
- Expo CLI (`npm install -g expo-cli`)

## Setup Instructions

1. **Extract the archive and install dependencies:**
   ```bash
   tar -xzf CampgroundsMobile-iOS-Source.tar.gz
   cd CampgroundsMobile
   npm install --legacy-peer-deps
   ```

2. **Install Expo and required packages:**
   ```bash
   npm install expo --legacy-peer-deps
   npm install @intercom/intercom-react-native --legacy-peer-deps
   npm install @react-native-async-storage/async-storage --legacy-peer-deps
   ```

3. **Generate native iOS project:**
   ```bash
   npx expo prebuild --clean
   ```

4. **Run the iOS app:**
   ```bash
   npx expo run:ios
   ```

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

1. **AsyncStorage Error**: Run `npx expo prebuild --clean` and rebuild
2. **Intercom Error**: Ensure you've run prebuild after adding the plugin
3. **Metro Cache Issues**: Run `npx expo start --clear`
4. **Build Errors**: Delete `ios/` folder and run `npx expo prebuild --clean`

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
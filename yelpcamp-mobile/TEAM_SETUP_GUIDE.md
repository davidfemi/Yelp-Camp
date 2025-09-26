# 🏕️ Team Setup Guide - CampgroundsMobile

## For New Team Members

If you're getting this error:
```
CommandError: No development build (com.campgrounds.mobile) for this project is installed.
```

**Don't panic!** This is expected. Follow these steps:

## Quick Start (5 minutes)

### 1. Prerequisites Check
- ✅ Node.js 18+ installed
- ✅ For iOS: Xcode installed
- ✅ For Android: Android Studio installed

### 2. One-Command Setup
```bash
# Make setup script executable and run it
chmod +x setup.sh && ./setup.sh
```

### 3. Run the App
```bash
# For iOS
npx expo run:ios

# For Android
npx expo run:android
```

## What's Different About This Project?

This is **NOT** a regular Expo Go project. It's an **Expo Development Build** because we use:
- 🗣️ Intercom (customer support chat)
- 🗺️ Google Maps (native maps)
- 📱 Other native features

## Manual Setup (if script fails)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Generate native code
npx expo prebuild --clean

# 3. Build and run
npx expo run:ios     # or run:android
```

## Development Workflow

### First Time Setup
1. Run `npx expo run:ios` (builds and installs the app)
2. App opens on simulator/device

### Daily Development
1. Start development server: `npx expo start --dev-client`
2. App automatically reloads when you make changes

### When You Add New Native Dependencies
1. Run `npx expo prebuild --clean`
2. Run `npx expo run:ios` again

## Common Questions

**Q: Why can't I use Expo Go?**
A: We use native dependencies that require custom builds.

**Q: Do I need to rebuild every time?**
A: No, only when native dependencies change.

**Q: Can I use the web version?**
A: Some features won't work, but you can try `npx expo start --web`

## Need Help?

1. Check the main README_FOR_DEVELOPERS.md
2. Ask in team chat
3. Check if your Node.js version is 18+
4. Try clearing cache: `npx expo start --clear`

## Platform-Specific Notes

### iOS
- Requires Xcode 14+
- First build takes 5-10 minutes
- Subsequent builds are faster

### Android
- Requires Android Studio
- Make sure you have an emulator running
- Or connect a physical device with USB debugging enabled

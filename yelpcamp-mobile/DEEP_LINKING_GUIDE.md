# Deep Linking Implementation Guide

## Overview

This document explains how to use the comprehensive deep linking system implemented in the Campgrounds Mobile app. The system supports both **Custom URL Schemes** and **Universal Links** for seamless navigation and sharing.

## Supported URL Schemes

### Custom Schemes
- `campgrounds://` - Primary custom scheme
- `com.campgrounds.mobile://` - Bundle identifier scheme

### Universal Links
- `https://thecampgrounds.com/`
- `https://www.thecampgrounds.com/`

## Available Deep Link Routes

### Authentication
- `campgrounds://login` - Login screen
- `campgrounds://register` - Registration screen

### Navigation Tabs
- `campgrounds://home` - Home tab
- `campgrounds://explore` - Explore tab
- `campgrounds://shop` - Shop tab
- `campgrounds://profile` - Profile tab

### Campgrounds
- `campgrounds://campground/{id}` - Specific campground detail
- `https://thecampgrounds.com/campground/{id}` - Universal link version

### Bookings
- `campgrounds://book/{campgroundId}` - Booking form for campground
- `campgrounds://booking/{id}` - Specific booking detail
- `campgrounds://bookings` - All user bookings

### Products & Shop
- `campgrounds://product/{id}` - Specific product detail
- `campgrounds://cart` - Shopping cart
- `campgrounds://checkout` - Checkout process

### Orders
- `campgrounds://orders` - All user orders
- `campgrounds://order/{id}` - Specific order detail

### Profile
- `campgrounds://profile` - Profile screen
- `campgrounds://profile/edit` - Edit profile screen

## Implementation Details

### Files Structure
```
src/
├── navigation/
│   ├── LinkingConfiguration.ts    # Main linking config
│   └── AppNavigator.tsx          # Updated with linking
├── utils/
│   ├── deepLinkUtils.ts          # Deep link handling utilities
│   └── testDeepLinks.ts          # Testing and demo functions
└── types/
    └── index.ts                  # Navigation type definitions
```

### Key Components

#### 1. LinkingConfiguration.ts
Contains the main React Navigation linking configuration with:
- URL prefixes and schemes
- Screen mapping
- Parameter parsing
- Custom link handlers

#### 2. deepLinkUtils.ts
Provides utility functions:
- `handleDeepLink(url)` - Process and navigate to deep links
- `isValidDeepLink(url)` - Validate deep link URLs
- `setNavigationRef(ref)` - Set navigation reference
- `shareDeepLink(url)` - Handle link sharing
- `openExternalURL(url)` - Open external URLs

#### 3. Helper Functions
```typescript
import { createDeepLink, createUniversalLink } from '../navigation/LinkingConfiguration';

// Create custom scheme links
const campgroundLink = createDeepLink.campground('64f1a2b3c4d5e6f7g8h9i0j1');
// Result: "campgrounds://campground/64f1a2b3c4d5e6f7g8h9i0j1"

// Create universal links
const universalLink = createUniversalLink.product('64f1a2b3c4d5e6f7g8h9i0j2');
// Result: "https://thecampgrounds.com/product/64f1a2b3c4d5e6f7g8h9i0j2"
```

## Usage Examples

### 1. Navigation from Code
```typescript
import { handleDeepLink } from '../utils/deepLinkUtils';

// Navigate to a specific campground
await handleDeepLink('campgrounds://campground/64f1a2b3c4d5e6f7g8h9i0j1');

// Navigate to booking form
await handleDeepLink('campgrounds://book/64f1a2b3c4d5e6f7g8h9i0j1');
```

### 2. Creating Shareable Links
```typescript
import { createUniversalLink } from '../navigation/LinkingConfiguration';

const shareableCampgroundLink = createUniversalLink.campground(campgroundId);
// Share this link via social media, email, etc.
```

### 3. Handling External Links
```typescript
import { openExternalURL } from '../utils/deepLinkUtils';

await openExternalURL('https://example.com/external-page');
```

### 4. Testing Deep Links
```typescript
import { showDeepLinkTestMenu } from '../utils/testDeepLinks';

// Show comprehensive test menu (for development)
showDeepLinkTestMenu();
```

## Configuration Files

### app.json Updates
```json
{
  "expo": {
    "scheme": "campgrounds",
    "ios": {
      "associatedDomains": [
        "applinks:thecampgrounds.com",
        "applinks:www.thecampgrounds.com"
      ]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "thecampgrounds.com"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

### iOS Configuration
The iOS AppDelegate already includes the necessary methods:
- `application(_:open:options:)` for custom schemes
- `application(_:continue:restorationHandler:)` for Universal Links

### Universal Links Setup (Production)
For Universal Links to work in production, you need to:

1. **Create `apple-app-site-association` file** on your web server:
```json
{
  "applinks": {
    "details": [
      {
        "appIDs": ["TEAMID.com.campgrounds.mobile"],
        "components": [
          {
            "/":" /campground/*",
            "comment": "Campground details"
          },
          {
            "/": "/product/*",
            "comment": "Product details"
          },
          {
            "/": "/book/*",
            "comment": "Booking flow"
          }
        ]
      }
    ]
  }
}
```

2. **Host the file** at:
   - `https://thecampgrounds.com/.well-known/apple-app-site-association`
   - `https://www.thecampgrounds.com/.well-known/apple-app-site-association`

3. **Ensure HTTPS** and proper content-type (`application/json`)

## Testing

### 1. Development Testing
```typescript
import { testDeepLinks } from '../utils/testDeepLinks';

// Run comprehensive tests
await testDeepLinks();
```

### 2. Device Testing
- **iOS Simulator**: Use Safari to test Universal Links
- **Physical Device**: 
  - Send links via Messages/Mail
  - Use Shortcuts app to test custom schemes
  - Test from external apps

### 3. Common Test URLs
```
// Custom schemes
campgrounds://campground/64f1a2b3c4d5e6f7g8h9i0j1
campgrounds://shop
campgrounds://profile

// Universal links
https://thecampgrounds.com/campground/64f1a2b3c4d5e6f7g8h9i0j1
https://thecampgrounds.com/product/64f1a2b3c4d5e6f7g8h9i0j2
```

## Error Handling

The system includes comprehensive error handling:

1. **Invalid URLs** - Shows user-friendly error messages
2. **Navigation failures** - Logs errors and provides fallbacks
3. **Network issues** - Handles offline scenarios gracefully
4. **Authentication** - Redirects to login when needed

## Integration with Intercom

The deep linking system is compatible with Intercom messaging:

1. **Customer Support Links** - Use universal links in support responses
2. **Push Notifications** - Include deep links in notification payloads
3. **In-App Messages** - Embed actionable deep links

### Example Intercom Message with Deep Link
```
"Check out this amazing campground! 
https://thecampgrounds.com/campground/64f1a2b3c4d5e6f7g8h9i0j1"
```

## Best Practices

1. **Always use Universal Links** for sharing to external users
2. **Use Custom Schemes** for internal app navigation
3. **Validate parameters** before navigation
4. **Provide fallbacks** for authentication-required screens
5. **Test on physical devices** for production validation
6. **Monitor analytics** for deep link usage patterns

## Troubleshooting

### Common Issues

1. **Links not opening app**
   - Check bundle identifier configuration
   - Verify app is installed
   - Test custom scheme vs universal link

2. **Navigation not working**
   - Ensure navigation ref is set
   - Check screen name spelling
   - Verify parameter format

3. **Universal Links opening browser**
   - Check apple-app-site-association file
   - Verify HTTPS configuration
   - Test after app installation

### Debug Commands
```typescript
// Check if URL can be opened
const canOpen = await Linking.canOpenURL(url);

// Get current route
const currentRoute = getCurrentRouteName();

// Validate deep link
const isValid = isValidDeepLink(url);
```

## Future Enhancements

1. **Analytics tracking** for deep link usage
2. **A/B testing** for different link formats
3. **Dynamic link generation** based on user context
4. **Deferred deep linking** for new user acquisition
5. **Branch.io integration** for advanced attribution 
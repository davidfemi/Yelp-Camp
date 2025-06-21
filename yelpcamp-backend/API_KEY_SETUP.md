# API Key Authentication Setup

## Overview
YelpCamp now supports session-free API access using a shared API access token. This allows external applications to access booking data programmatically.

## Environment Configuration

Add the following environment variable to your `.env` file:

```bash
# API Access Token (for session-free API access)
API_ACCESS_TOKEN=your-secure-api-token-here
```

### Generating a Secure API Token

For production, generate a secure random string (32+ characters). You can use:

**Node.js:**
```javascript
require('crypto').randomBytes(32).toString('hex')
```

**Online Generator:**
Use a secure password generator to create a 32+ character random string.

**Example:**
```bash
API_ACCESS_TOKEN=a1b2c3d4e5f6789abcdef123456789ab012345
```

## API Usage

### Get Bookings by User ID

**Endpoint:** `GET /api/booking/:user_id`

**Headers:**
```
Authorization: Bearer YOUR_API_ACCESS_TOKEN
Content-Type: application/json
```

**Example Request:**
```bash
curl -X GET "https://your-backend-url.com/api/booking/64f8a123456789abcdef0123" \
  -H "Authorization: Bearer a1b2c3d4e5f6789abcdef123456789ab012345" \
  -H "Content-Type: application/json"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "64f8a123456789abcdef0125",
        "user": {
          "_id": "64f8a123456789abcdef0123",
          "username": "johndoe",
          "email": "john@example.com"
        },
        "campground": {
          "_id": "64f8a123456789abcdef0126",
          "title": "Mountain View Campground",
          "location": "Yosemite, CA",
          "price": 45,
          "images": [...]
        },
        "days": 3,
        "totalPrice": 135,
        "status": "confirmed",
        "checkInDate": "2024-01-15T00:00:00.000Z",
        "checkOutDate": "2024-01-18T00:00:00.000Z",
        "createdAt": "2024-01-10T12:00:00.000Z"
      }
    ],
    "user": {
      "_id": "64f8a123456789abcdef0123",
      "username": "johndoe",
      "email": "john@example.com"
    },
    "total": 1
  }
}
```

## Security Features

### Rate Limiting
- **100 requests per 15 minutes** per IP address
- Helps prevent API abuse

### Request Validation
- Validates user_id format (MongoDB ObjectId)
- Checks if user exists before returning data
- Returns 404 if user not found

### Audit Logging
- All API requests are logged with IP address and endpoint
- Invalid token attempts are logged for security monitoring

## Error Responses

### Invalid API Token
```json
{
  "success": false,
  "error": "Invalid API token"
}
```

### Missing Authorization Header
```json
{
  "success": false,
  "error": "Missing or invalid Authorization header. Use: Authorization: Bearer YOUR_API_TOKEN"
}
```

### Rate Limit Exceeded
```json
{
  "success": false,
  "error": "Too many API requests, please try again later.",
  "retryAfter": "15 minutes"
}
```

### Invalid User ID
```json
{
  "success": false,
  "error": "Invalid user_id format"
}
```

### User Not Found
```json
{
  "success": false,
  "error": "User not found"
}
```

## Integration Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const getBookingsForUser = async (userId) => {
  try {
    const response = await axios.get(`https://your-backend-url.com/api/booking/${userId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error.response?.data || error.message);
    throw error;
  }
};
```

### Python
```python
import requests
import os

def get_bookings_for_user(user_id):
    url = f"https://your-backend-url.com/api/booking/{user_id}"
    headers = {
        'Authorization': f"Bearer {os.getenv('API_ACCESS_TOKEN')}",
        'Content-Type': 'application/json'
    }
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()
```

## Deployment Notes

1. **Keep API Token Secret**: Never commit the API token to version control
2. **Use Environment Variables**: Store the token in your deployment environment
3. **Monitor Usage**: Check logs for unusual API activity
4. **Rotate Tokens**: Consider rotating the API token periodically for security

## Existing Session-Based API

The existing session-based authentication continues to work:
- `GET /api/bookings` - Returns bookings for currently authenticated user
- Requires login session/cookies
- Used by the web application frontend

Both authentication methods work simultaneously without conflicts. 
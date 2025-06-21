# The Campgrounds API Documentation

## Base URLs

- **Production**: `https://yelpcamp-vvv2.onrender.com`
- **Development**: `http://localhost:5000`

## Authentication

The API uses session-based authentication with cookies. All authenticated requests must include credentials.

### Headers
```
Content-Type: application/json
```

### Cookies
Authentication is handled via HTTP-only session cookies. Include credentials in requests:
```javascript
fetch(url, {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
})
```

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a123456789abcdef0123",
      "username": "johndoe",
      "email": "john@example.com"
    }
  },
  "message": "Registration successful"
}
```

### Login User
**POST** `/api/auth/login`

Authenticate user and create session.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a123456789abcdef0123",
      "username": "johndoe",
      "email": "john@example.com"
    }
  },
  "message": "Login successful"
}
```

### Logout User
**POST** `/api/auth/logout`

End user session.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Get Current User
**GET** `/api/auth/me`

Get currently authenticated user information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f8a123456789abcdef0123",
      "username": "johndoe",
      "email": "john@example.com"
    }
  }
}
```

## Campground Endpoints

### Get All Campgrounds
**GET** `/api/campgrounds`

Retrieve paginated list of campgrounds with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search term for title, description, or location
- `location` (string): Filter by location
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `sortBy` (string): Sort field (default: 'title')
- `sortOrder` (string): 'asc' or 'desc' (default: 'asc')

**Example:**
```
GET /api/campgrounds?page=1&limit=10&search=mountain&minPrice=20&maxPrice=100
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "campgrounds": [
      {
        "_id": "64f8a123456789abcdef0123",
        "title": "Mountain View Campground",
        "description": "Beautiful mountain views...",
        "location": "Yosemite, CA",
        "price": 45,
        "images": [
          {
            "url": "https://res.cloudinary.com/...",
            "filename": "campground_123"
          }
        ],
        "author": {
          "_id": "64f8a123456789abcdef0124",
          "username": "johndoe"
        },
        "reviews": []
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCampgrounds": 47,
      "hasNextPage": true,
      "hasPrevPage": false,
      "limit": 10
    }
  }
}
```

### Get Single Campground
**GET** `/api/campgrounds/:id`

Retrieve detailed information about a specific campground.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "campground": {
      "_id": "64f8a123456789abcdef0123",
      "title": "Mountain View Campground",
      "description": "Beautiful mountain views...",
      "location": "Yosemite, CA",
      "price": 45,
      "images": [...],
      "author": {
        "_id": "64f8a123456789abcdef0124",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "reviews": [
        {
          "_id": "64f8a123456789abcdef0125",
          "rating": 5,
          "body": "Amazing campground!",
          "author": {
            "_id": "64f8a123456789abcdef0126",
            "username": "janedoe"
          },
          "createdAt": "2023-09-06T12:00:00.000Z"
        }
      ],
      "geometry": {
        "type": "Point",
        "coordinates": [-119.538329, 37.865101]
      }
    },
    "stats": {
      "averageRating": 4.5,
      "totalReviews": 12
    }
  }
}
```

### Create Campground
**POST** `/api/campgrounds`

Create a new campground. **Requires authentication.**

**Request Body:**
```json
{
  "title": "Sunset Beach Campground",
  "description": "Stunning sunset views over the ocean...",
  "location": "Big Sur, CA",
  "price": 65,
  "images": [
    {
      "url": "https://res.cloudinary.com/...",
      "filename": "campground_sunset_123"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "campground": {
      "_id": "64f8a123456789abcdef0127",
      "title": "Sunset Beach Campground",
      "description": "Stunning sunset views over the ocean...",
      "location": "Big Sur, CA",
      "price": 65,
      "images": [...],
      "author": "64f8a123456789abcdef0124",
      "reviews": [],
      "geometry": {
        "type": "Point",
        "coordinates": [-121.808447, 36.270026]
      }
    }
  },
  "message": "Campground created successfully"
}
```

### Update Campground
**PUT** `/api/campgrounds/:id`

Update an existing campground. **Requires authentication and ownership.**

**Request Body:** (partial update supported)
```json
{
  "title": "Updated Campground Name",
  "price": 75
}
```

### Delete Campground
**DELETE** `/api/campgrounds/:id`

Delete a campground. **Requires authentication and ownership.**

**Response (200):**
```json
{
  "success": true,
  "message": "Campground deleted successfully"
}
```

## Review Endpoints

### Add Review
**POST** `/api/campgrounds/:id/reviews`

Add a review to a campground. **Requires authentication.**

**Request Body:**
```json
{
  "rating": 5,
  "body": "Absolutely loved this campground! The views were incredible and the facilities were clean."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "review": {
      "_id": "64f8a123456789abcdef0128",
      "rating": 5,
      "body": "Absolutely loved this campground!...",
      "author": {
        "_id": "64f8a123456789abcdef0124",
        "username": "johndoe"
      },
      "createdAt": "2023-09-06T14:30:00.000Z",
      "updatedAt": "2023-09-06T14:30:00.000Z"
    }
  },
  "message": "Review added successfully"
}
```

### Delete Review
**DELETE** `/api/campgrounds/:id/reviews/:reviewId`

Delete a review. **Requires authentication and ownership.**

**Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully"
}
```

## Search and Category Endpoints

### Search Campgrounds
**GET** `/api/campgrounds/search/:term`

Search for campgrounds by term.

**Query Parameters:**
- `limit` (number): Maximum results (default: 10)

**Example:**
```
GET /api/campgrounds/search/beach?limit=5
```

### Get Campgrounds by Category
**GET** `/api/campgrounds/category/:type`

Get campgrounds by category type.

**Valid Categories:**
- `ocean`, `mountain`, `desert`, `river`, `lake`, `forest`

**Query Parameters:**
- `limit` (number): Maximum results (default: 20)

## Statistics Endpoint

### Get Application Stats
**GET** `/api/stats`

Get application statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalCampgrounds": 47,
    "totalReviews": 156,
    "pricing": {
      "avgPrice": 52.3,
      "minPrice": 15,
      "maxPrice": 150
    },
    "topLocations": [
      {
        "_id": "Yosemite, CA",
        "count": 5
      }
    ]
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Permission denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Rate Limiting

API requests are not currently rate-limited, but this may be implemented in future versions.

## CORS

The API supports CORS and accepts requests from:
- `https://thecampground.vercel.app` (production)
- `http://localhost:3000` (development)

## Example Usage with JavaScript

```javascript
// Register new user
const registerUser = async (userData) => {
  const response = await fetch('https://yelpcamp-vvv2.onrender.com/api/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData)
  });
  return response.json();
};

// Get campgrounds
const getCampgrounds = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`https://yelpcamp-vvv2.onrender.com/api/campgrounds?${queryString}`, {
    credentials: 'include'
  });
  return response.json();
};

// Add review
const addReview = async (campgroundId, reviewData) => {
  const response = await fetch(`https://yelpcamp-vvv2.onrender.com/api/campgrounds/${campgroundId}/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData)
  });
  return response.json();
};
``` 
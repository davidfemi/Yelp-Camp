# Order API Documentation

## Overview
The Campgrounds Order API provides comprehensive order management for both product purchases and campground bookings. This API supports session-based authentication for web applications and token-based authentication for external integrations.

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Session-Based Authentication
Used by the web application frontend:
- Requires user login session/cookies
- Automatic session management
- Used for all user-facing operations

### Token-Based Authentication
For external API access:
- Requires `Authorization: Bearer YOUR_API_TOKEN` header
- Configure `API_ACCESS_TOKEN` in environment variables
- Rate limited to 100 requests per 15 minutes per IP

## Data Models

### Order Model
```javascript
{
  _id: ObjectId,
  user: ObjectId, // Reference to User
  items: [{
    product: ObjectId, // Reference to Product
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String, // 'pending', 'processing', 'shipped', 'delivered', 'cancelled'
  shippingAddress: {
    name: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    country: String // Default: 'USA'
  },
  orderNumber: String, // Auto-generated: 'TC-{timestamp}-{random}'
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String, // 'apparel', 'accessories', 'drinkware', 'stationery'
  inStock: Boolean,
  stockQuantity: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Booking Model
```javascript
{
  _id: ObjectId,
  user: ObjectId, // Reference to User
  campground: ObjectId, // Reference to Campground
  days: Number,
  totalPrice: Number,
  status: String, // 'confirmed', 'cancelled'
  createdAt: Date
}
```

## Product Orders API

### Create Order
Creates a new product order and updates stock quantities.

**Endpoint:** `POST /api/orders`

**Authentication:** Required (Session-based or Token-based)

**Request Body (Session-based authentication):**
```json
{
  "items": [
    {
      "productId": "64f8a123456789abcdef0123",
      "quantity": 2
    },
    {
      "productId": "64f8a123456789abcdef0124",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  }
}
```

**Request Body (Token-based authentication):**
```json
{
  "userId": "64f8a123456789abcdef0120",
  "items": [
    {
      "productId": "64f8a123456789abcdef0123",
      "quantity": 2
    },
    {
      "productId": "64f8a123456789abcdef0124",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "name": "John Doe",
    "address": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102",
    "country": "USA"
  }
}
```

**Headers (Token-based authentication):**
```
Authorization: Bearer YOUR_API_ACCESS_TOKEN
Content-Type: application/json
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64f8a123456789abcdef0125",
      "user": {
        "_id": "64f8a123456789abcdef0120",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "items": [
        {
          "_id": "64f8a123456789abcdef0126",
          "product": {
            "_id": "64f8a123456789abcdef0123",
            "name": "Adventure Coffee Mug",
            "price": 15.99,
            "image": "https://example.com/mug.jpg"
          },
          "quantity": 2,
          "price": 15.99
        }
      ],
      "totalAmount": 31.98,
      "status": "pending",
      "shippingAddress": {
        "name": "John Doe",
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102",
        "country": "USA"
      },
      "orderNumber": "TC-1704067200000-A1B2C",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Order placed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Missing items or shipping address
- `400 Bad Request`: Missing userId (when using token authentication)
- `400 Bad Request`: Invalid userId format
- `400 Bad Request`: Product not found
- `400 Bad Request`: Product out of stock
- `400 Bad Request`: Insufficient stock quantity
- `401 Unauthorized`: User not authenticated or invalid token

### Get User Orders
Retrieves all orders for the authenticated user.

**Endpoint:** `GET /api/orders`

**Authentication:** Required (Session-based)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "64f8a123456789abcdef0125",
        "items": [
          {
            "_id": "64f8a123456789abcdef0126",
            "product": {
              "_id": "64f8a123456789abcdef0123",
              "name": "Adventure Coffee Mug",
              "price": 15.99,
              "image": "https://example.com/mug.jpg"
            },
            "quantity": 2,
            "price": 15.99
          }
        ],
        "totalAmount": 31.98,
        "status": "pending",
        "orderNumber": "TC-1704067200000-A1B2C",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Order Details
Retrieves details for a specific order.

**Endpoint:** `GET /api/orders/:id`

**Authentication:** Required (Session-based)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64f8a123456789abcdef0125",
      "user": {
        "_id": "64f8a123456789abcdef0120",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "items": [
        {
          "_id": "64f8a123456789abcdef0126",
          "product": {
            "_id": "64f8a123456789abcdef0123",
            "name": "Adventure Coffee Mug",
            "price": 15.99,
            "image": "https://example.com/mug.jpg"
          },
          "quantity": 2,
          "price": 15.99
        }
      ],
      "totalAmount": 31.98,
      "status": "pending",
      "shippingAddress": {
        "name": "John Doe",
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102",
        "country": "USA"
      },
      "orderNumber": "TC-1704067200000-A1B2C",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Order not found
- `403 Forbidden`: Permission denied (user doesn't own order)
- `401 Unauthorized`: User not authenticated

## Products API

### Get All Products
Retrieves all products with optional filtering.

**Endpoint:** `GET /api/products`

**Query Parameters:**
- `category`: Filter by category ('apparel', 'accessories', 'drinkware', 'stationery')
- `inStock`: Filter by stock status ('true' or 'false')

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "64f8a123456789abcdef0123",
        "name": "Adventure Coffee Mug",
        "description": "Perfect for your morning coffee at the campsite",
        "price": 15.99,
        "image": "https://example.com/mug.jpg",
        "category": "drinkware",
        "inStock": true,
        "stockQuantity": 50,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Product Details
Retrieves details for a specific product.

**Endpoint:** `GET /api/products/:id`

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "64f8a123456789abcdef0123",
      "name": "Adventure Coffee Mug",
      "description": "Perfect for your morning coffee at the campsite",
      "price": 15.99,
      "image": "https://example.com/mug.jpg",
      "category": "drinkware",
      "inStock": true,
      "stockQuantity": 50,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `404 Not Found`: Product not found

## Campground Bookings API

### Create Booking
Creates a new campground booking.

**Endpoint:** `POST /api/campgrounds/:id/bookings`

**Authentication:** Required (Session-based)

**Request Body:**
```json
{
  "days": 3
}
```

**Success Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "64f8a123456789abcdef0127",
      "user": {
        "_id": "64f8a123456789abcdef0120",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "campground": {
        "_id": "64f8a123456789abcdef0128",
        "title": "Mountain View Campground",
        "location": "Yosemite, CA",
        "price": 45
      },
      "days": 3,
      "totalPrice": 135,
      "status": "confirmed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  },
  "message": "Booking created successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid days value (must be >= 1)
- `404 Not Found`: Campground not found
- `401 Unauthorized`: User not authenticated

### Get User Bookings
Retrieves all bookings for the authenticated user.

**Endpoint:** `GET /api/bookings`

**Authentication:** Required (Session-based)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "64f8a123456789abcdef0127",
        "campground": {
          "_id": "64f8a123456789abcdef0128",
          "title": "Mountain View Campground",
          "location": "Yosemite, CA",
          "price": 45,
          "images": [
            {
              "url": "https://example.com/campground1.jpg",
              "filename": "campground1"
            }
          ]
        },
        "days": 3,
        "totalPrice": 135,
        "status": "confirmed",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Bookings by User ID (API Token)
Retrieves bookings for a specific user using API token authentication.

**Endpoint:** `GET /api/bookings/user/:userId`

**Authentication:** Required (Token-based or Session-based)

**Headers:**
```
Authorization: Bearer YOUR_API_ACCESS_TOKEN
Content-Type: application/json
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "64f8a123456789abcdef0127",
        "user": {
          "_id": "64f8a123456789abcdef0120",
          "username": "johndoe",
          "email": "john@example.com"
        },
        "campground": {
          "_id": "64f8a123456789abcdef0128",
          "title": "Mountain View Campground",
          "location": "Yosemite, CA",
          "price": 45,
          "images": [
            {
              "url": "https://example.com/campground1.jpg",
              "filename": "campground1"
            }
          ]
        },
        "days": 3,
        "totalPrice": 135,
        "status": "confirmed",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid user ID format
- `403 Forbidden`: Permission denied
- `401 Unauthorized`: Invalid or missing API token

### Get Booking Details
Retrieves details for a specific booking.

**Endpoint:** `GET /api/bookings/:id`

**Authentication:** Required (Token-based or Session-based)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "64f8a123456789abcdef0127",
      "user": {
        "_id": "64f8a123456789abcdef0120",
        "username": "johndoe",
        "email": "john@example.com"
      },
      "campground": {
        "_id": "64f8a123456789abcdef0128",
        "title": "Mountain View Campground",
        "location": "Yosemite, CA",
        "price": 45,
        "images": [
          {
            "url": "https://example.com/campground1.jpg",
            "filename": "campground1"
          }
        ]
      },
      "days": 3,
      "totalPrice": 135,
      "status": "confirmed",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid booking ID format
- `404 Not Found`: Booking not found
- `403 Forbidden`: Permission denied
- `401 Unauthorized`: Invalid authentication

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200 OK`: Successful GET request
- `201 Created`: Successful POST request (resource created)
- `400 Bad Request`: Invalid request data or parameters
- `401 Unauthorized`: Authentication required or invalid
- `403 Forbidden`: Permission denied
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

### API Token Access
- **Limit:** 100 requests per 15 minutes per IP address
- **Response when exceeded:**
```json
{
  "success": false,
  "error": "Too many API requests, please try again later.",
  "retryAfter": "15 minutes"
}
```

## Integration Examples

### JavaScript/Node.js - Create Order (Session-based)
```javascript
const axios = require('axios');

const createOrder = async (items, shippingAddress) => {
  try {
    const response = await axios.post('http://localhost:5000/api/orders', {
      items,
      shippingAddress
    }, {
      withCredentials: true, // Include session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
const orderData = {
  items: [
    { productId: '64f8a123456789abcdef0123', quantity: 2 }
  ],
  shippingAddress: {
    name: 'John Doe',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102'
  }
};

createOrder(orderData.items, orderData.shippingAddress);
```

### JavaScript/Node.js - Create Order (Token-based)
```javascript
const axios = require('axios');

const createOrderWithToken = async (userId, items, shippingAddress) => {
  try {
    const response = await axios.post('http://localhost:5000/api/orders', {
      userId,
      items,
      shippingAddress
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
};

// Usage
const orderData = {
  userId: '64f8a123456789abcdef0120',
  items: [
    { productId: '64f8a123456789abcdef0123', quantity: 2 }
  ],
  shippingAddress: {
    name: 'John Doe',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102'
  }
};

createOrderWithToken(orderData.userId, orderData.items, orderData.shippingAddress);
```

### JavaScript/Node.js - Get Bookings with API Token
```javascript
const axios = require('axios');

const getBookingsForUser = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/bookings/user/${userId}`, {
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

### Python - Create Order
```python
import requests

def create_order(items, shipping_address, session_cookies):
    url = "http://localhost:5000/api/orders"
    data = {
        "items": items,
        "shippingAddress": shipping_address
    }
    
    response = requests.post(url, json=data, cookies=session_cookies)
    
    if response.status_code == 201:
        return response.json()
    else:
        response.raise_for_status()

# Usage
order_data = {
    "items": [
        {"productId": "64f8a123456789abcdef0123", "quantity": 2}
    ],
    "shippingAddress": {
        "name": "John Doe",
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102"
    }
}

create_order(order_data["items"], order_data["shippingAddress"], session_cookies)
```

### cURL Examples

#### Create Order (Session-based)
```bash
curl -X POST "http://localhost:5000/api/orders" \
  -H "Content-Type: application/json" \
  -b "session_cookie_name=session_value" \
  -d '{
    "items": [
      {
        "productId": "64f8a123456789abcdef0123",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "name": "John Doe",
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102"
    }
  }'
```

#### Create Order (Token-based)
```bash
curl -X POST "http://localhost:5000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -d '{
    "userId": "64f8a123456789abcdef0120",
    "items": [
      {
        "productId": "64f8a123456789abcdef0123",
        "quantity": 2
      }
    ],
    "shippingAddress": {
      "name": "John Doe",
      "address": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102"
    }
  }'
```

#### Get Bookings with API Token
```bash
curl -X GET "http://localhost:5000/api/bookings/user/64f8a123456789abcdef0120" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## Environment Configuration

### Required Environment Variables
```bash
# Database
DB_URL=mongodb://localhost:27017/yelpcamp

# API Access Token (for external API access)
API_ACCESS_TOKEN=your-secure-api-token-here

# Session Configuration
SESSION_SECRET=your-session-secret

# Mapbox (for campground geocoding)
MAPBOX_TOKEN=your-mapbox-token

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret
```

### Security Best Practices
1. **Keep API tokens secure**: Never commit tokens to version control
2. **Use HTTPS in production**: Encrypt all API communications
3. **Rotate tokens regularly**: Update API tokens periodically
4. **Monitor API usage**: Track unusual activity patterns
5. **Validate all inputs**: Server-side validation for all requests
6. **Rate limiting**: Prevent API abuse with appropriate limits

## Order Status Workflow

### Product Orders
1. **pending**: Order created, payment processing
2. **processing**: Order confirmed, preparing for shipment
3. **shipped**: Order dispatched, tracking available
4. **delivered**: Order received by customer
5. **cancelled**: Order cancelled (before shipping)

### Campground Bookings
1. **confirmed**: Booking confirmed and active
2. **cancelled**: Booking cancelled by user

## Stock Management

### Automatic Stock Updates
- Stock quantities are automatically decremented when orders are placed
- Out-of-stock products cannot be ordered
- Insufficient stock prevents order completion

### Stock Validation
- Real-time stock checking during order creation
- Prevents overselling with concurrent orders
- Returns specific error messages for stock issues

## Deployment Notes

### Production Considerations
1. **Database indexes**: Ensure proper indexing for order queries
2. **Backup strategy**: Regular database backups for order data
3. **Monitoring**: Set up alerts for order failures
4. **Scaling**: Consider read replicas for high-traffic scenarios
5. **Logging**: Comprehensive logging for order tracking

### Performance Optimization
- Use database connection pooling
- Implement caching for product data
- Optimize queries with proper population
- Monitor response times and optimize slow queries

---

*Last updated: January 2024*
*API Version: 1.0.0* 
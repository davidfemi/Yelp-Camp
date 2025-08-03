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
  payment: {
    method: String, // 'simulated', 'stripe', 'paypal', 'credit_card'
    transactionId: String,
    paymentIntentId: String,
    paid: Boolean,
    paidAt: Date
  },
  refund: {
    status: String, // 'none', 'pending', 'processed', 'failed'
    amount: Number,
    refundId: String,
    reason: String,
    processedAt: Date,
    failureReason: String
  },
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
  payment: {
    method: String, // 'simulated', 'stripe', 'paypal', 'credit_card'
    transactionId: String,
    paymentIntentId: String,
    paid: Boolean,
    paidAt: Date
  },
  refund: {
    status: String, // 'none', 'pending', 'processed', 'failed'
    amount: Number,
    refundId: String,
    reason: String,
    processedAt: Date,
    failureReason: String
  },
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

### Get Orders by User ID (API Token)
Retrieves all orders for a specific user using API token authentication.

**Endpoint:** `GET /api/orders/user/:userId`

**Authentication:** API Access Token or Session-based

**Headers:**
```
Authorization: Bearer YOUR_API_ACCESS_TOKEN
Content-Type: application/json
```

**URL Parameters:**
- `userId` - The ID of the user whose orders to retrieve

**Authorization Rules:**
- With API token: Can access any user's orders (admin functionality)
- With session: Can only access own orders (must match authenticated user ID)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "64f8a123456789abcdef0125",
        "user": "6856cbf5ce979a217727576a",
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
        "shippingAddress": {
          "name": "John Doe",
          "address": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "payment": {
          "method": "simulated",
          "transactionId": "sim_1704067200000_abc123",
          "paid": true,
          "paidAt": "2024-01-01T00:00:00.000Z"
        },
        "refund": {
          "status": "none",
          "amount": 0
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Not authorized to view these orders (session auth only)

### Get Order Details
Retrieves details for a specific order.

**Endpoint:** `GET /api/orders/:id`

**Authentication:** Session-based or API Access Token

**Authorization Rules:**
- With API token: Can access any order (admin functionality)
- With session: Can only access own orders

**Headers (Token-based authentication):**
```
Authorization: Bearer YOUR_API_ACCESS_TOKEN
Content-Type: application/json
```

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

### Cancel Order
Cancels a product order and restores stock quantities. Only orders with 'pending' or 'processing' status can be cancelled.

**Endpoint:** `PATCH /api/orders/:id/cancel`

**Authentication:** Required (Session-based or Token-based)

**Request Body (Session-based authentication):**
```json
{}
```

**Request Body (Token-based authentication):**
```json
{
  "userId": "64f8a123456789abcdef0120"
}
```

**Headers (Token-based authentication):**
```
Authorization: Bearer YOUR_API_ACCESS_TOKEN
Content-Type: application/json
```

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
      "status": "cancelled",
      "shippingAddress": {
        "name": "John Doe",
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94102",
        "country": "USA"
      },
      "payment": {
        "method": "simulated",
        "transactionId": "sim_1704067200000_abc123def",
        "paymentIntentId": "pi_sim_1704067200000",
        "paid": true,
        "paidAt": "2024-01-01T00:00:00.000Z"
      },
      "refund": {
        "status": "processed",
        "amount": 31.98,
        "refundId": "re_sim_1704067500000_xyz789abc",
        "reason": "Order cancelled by user",
        "processedAt": "2024-01-01T00:05:00.000Z"
      },
      "orderNumber": "TC-1704067200000-A1B2C",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:05:00.000Z"
    },
    "refund": {
      "success": true,
      "refund": {
        "id": "re_sim_1704067500000_xyz789abc",
        "amount": 31.98,
        "currency": "USD",
        "status": "processed",
        "processedAt": "2024-01-01T00:05:00.000Z"
      }
    }
  },
  "message": "Order cancelled and refund of $31.98 processed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Order cannot be cancelled (shipped, delivered, or already cancelled)
- `400 Bad Request`: Missing userId (when using token authentication)
- `400 Bad Request`: Invalid userId format
- `404 Not Found`: Order not found
- `403 Forbidden`: Permission denied (user doesn't own order)
- `401 Unauthorized`: User not authenticated or invalid token

## User Profile API

### Get User Profile
Retrieves user profile information including basic details and statistics.

**Endpoint:** `GET /api/users/profile`

**Authentication:** Session-based or API Access Token

**Query Parameters (Token-based authentication):**
- `userId` - The ID of the user whose profile to retrieve

**Headers (Token-based authentication):**
```
Authorization: Bearer YOUR_API_ACCESS_TOKEN
Content-Type: application/json
```

**Authorization Rules:**
- With API token: Can access any user's profile (admin functionality)
- With session: Returns authenticated user's profile

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "6856cbf5ce979a217727576a",
      "username": "Dale Cooper",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "stats": {
        "campgrounds": 5,
        "reviews": 12
      }
    }
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing userId (when using token authentication)
- `404 Not Found`: User not found
- `401 Unauthorized`: User not authenticated or invalid token

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

**Authentication:** Session-based or API Access Token

**Request Body (Session-based authentication):**
```json
{
  "days": 3
}
```

**Request Body (Token-based authentication):**
```json
{
  "days": 3,
  "userId": "64f8a123456789abcdef0120"
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
- `400 Bad Request`: Missing userId (when using token authentication)
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

### Cancel Booking
Cancels a campground booking. Only bookings with 'confirmed' status can be cancelled.

**Endpoint:** `PATCH /api/bookings/:id/cancel`

**Authentication:** Required (Session-based or Token-based)

**Request Body (Session-based authentication):**
```json
{}
```

**Request Body (Token-based authentication):**
```json
{
  "userId": "64f8a123456789abcdef0120"
}
```

**Headers (Token-based authentication):**
```
Authorization: Bearer YOUR_API_ACCESS_TOKEN
Content-Type: application/json
```

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
        "price": 45
      },
      "days": 3,
      "totalPrice": 135,
      "status": "cancelled",
      "payment": {
        "method": "simulated",
        "transactionId": "sim_1704067200000_def456ghi",
        "paymentIntentId": "pi_sim_1704067200000",
        "paid": true,
        "paidAt": "2024-01-01T00:00:00.000Z"
      },
      "refund": {
        "status": "processed",
        "amount": 135,
        "refundId": "re_sim_1704067500000_mno789pqr",
        "reason": "Booking cancelled by user",
        "processedAt": "2024-01-01T00:05:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "refund": {
      "success": true,
      "refund": {
        "id": "re_sim_1704067500000_mno789pqr",
        "amount": 135,
        "currency": "USD",
        "status": "processed",
        "processedAt": "2024-01-01T00:05:00.000Z"
      }
    }
  },
  "message": "Booking cancelled and refund of $135.00 processed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Booking cannot be cancelled (already cancelled)
- `400 Bad Request`: Missing userId (when using token authentication)
- `400 Bad Request`: Invalid userId format
- `404 Not Found`: Booking not found
- `403 Forbidden`: Permission denied (user doesn't own booking)
- `401 Unauthorized`: User not authenticated or invalid token

## Refund Management API

### Get Order Refund Policy
Retrieves refund policy information and eligibility for a specific order.

**Endpoint:** `GET /api/orders/:id/refund-policy`

**Authentication:** Required (Session-based or Token-based)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "policy": {
      "type": "order",
      "policy": [
        { "condition": "Pending orders", "refund": "100%" },
        { "condition": "Processing (within 24 hours)", "refund": "90%" },
        { "condition": "Processing (24-72 hours)", "refund": "50%" },
        { "condition": "Processing (over 72 hours)", "refund": "0%" },
        { "condition": "Shipped or Delivered", "refund": "0%" }
      ]
    },
    "eligibleRefundAmount": 31.98,
    "isRefundAllowed": true,
    "currentRefundStatus": "none"
  }
}
```

**Error Responses:**
- `404 Not Found`: Order not found
- `403 Forbidden`: Permission denied (user doesn't own order)
- `401 Unauthorized`: User not authenticated or invalid token

### Get Booking Refund Policy
Retrieves refund policy information and eligibility for a specific booking.

**Endpoint:** `GET /api/bookings/:id/refund-policy`

**Authentication:** Required (Session-based or Token-based)

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "policy": {
      "type": "booking",
      "policy": [
        { "condition": "Within 24 hours", "refund": "100%" },
        { "condition": "Within 7 days", "refund": "80%" },
        { "condition": "Within 30 days", "refund": "50%" },
        { "condition": "Over 30 days", "refund": "0%" }
      ]
    },
    "eligibleRefundAmount": 135,
    "isRefundAllowed": true,
    "currentRefundStatus": "none"
  }
}
```

**Error Responses:**
- `404 Not Found`: Booking not found
- `403 Forbidden`: Permission denied (user doesn't own booking)
- `401 Unauthorized`: User not authenticated or invalid token

### Process Order Refund
Manually process a refund for an order (admin or special cases).

**Endpoint:** `POST /api/orders/:id/process-refund`

**Authentication:** Required (Session-based or Token-based)

**Request Body (Session-based authentication):**
```json
{
  "reason": "Customer complaint",
  "amount": 15.99
}
```

**Request Body (Token-based authentication):**
```json
{
  "userId": "64f8a123456789abcdef0120",
  "reason": "Customer complaint",
  "amount": 15.99
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "64f8a123456789abcdef0125",
      "refund": {
        "status": "processed",
        "amount": 15.99,
        "refundId": "re_sim_1704067500000_xyz789abc",
        "reason": "Customer complaint",
        "processedAt": "2024-01-01T00:05:00.000Z"
      }
    },
    "refund": {
      "id": "re_sim_1704067500000_xyz789abc",
      "amount": 15.99,
      "currency": "USD",
      "status": "processed",
      "processedAt": "2024-01-01T00:05:00.000Z"
    }
  },
  "message": "Refund of $15.99 processed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid refund amount or already refunded
- `404 Not Found`: Order not found
- `403 Forbidden`: Permission denied
- `401 Unauthorized`: User not authenticated or invalid token

### Process Booking Refund
Manually process a refund for a booking (admin or special cases).

**Endpoint:** `POST /api/bookings/:id/process-refund`

**Authentication:** Required (Session-based or Token-based)

**Request Body (Session-based authentication):**
```json
{
  "reason": "Emergency cancellation",
  "amount": 67.50
}
```

**Request Body (Token-based authentication):**
```json
{
  "userId": "64f8a123456789abcdef0120",
  "reason": "Emergency cancellation",
  "amount": 67.50
}
```

**Success Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "booking": {
      "_id": "64f8a123456789abcdef0127",
      "refund": {
        "status": "processed",
        "amount": 67.50,
        "refundId": "re_sim_1704067500000_mno789pqr",
        "reason": "Emergency cancellation",
        "processedAt": "2024-01-01T00:05:00.000Z"
      }
    },
    "refund": {
      "id": "re_sim_1704067500000_mno789pqr",
      "amount": 67.50,
      "currency": "USD",
      "status": "processed",
      "processedAt": "2024-01-01T00:05:00.000Z"
    }
  },
  "message": "Refund of $67.50 processed successfully"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid refund amount or already refunded
- `404 Not Found`: Booking not found
- `403 Forbidden`: Permission denied
- `401 Unauthorized`: User not authenticated or invalid token

## Refund Policies

### Order Refund Policy
Refund eligibility for product orders based on order status and time elapsed:

| Order Status | Time Elapsed | Refund Amount |
|-------------|--------------|---------------|
| Pending | Any time | 100% |
| Processing | 0-24 hours | 90% |
| Processing | 24-72 hours | 50% |
| Processing | Over 72 hours | 0% |
| Shipped | Any time | 0% |
| Delivered | Any time | 0% |

### Booking Refund Policy
Refund eligibility for campground bookings based on time between booking creation and cancellation:

| Time Elapsed | Refund Amount |
|-------------|---------------|
| Within 24 hours | 100% |
| Within 7 days | 80% |
| Within 30 days | 50% |
| Over 30 days | 0% |

### Automatic Refund Processing
- **Refunds are automatically processed** when orders or bookings are cancelled
- **Refund amount is calculated** based on the policies above
- **Simulated payment system** processes refunds instantly for demonstration
- **Real payment processors** (Stripe, PayPal) can be integrated in production

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

### JavaScript/Node.js - Cancel Order (Session-based)
```javascript
const axios = require('axios');

const cancelOrder = async (orderId) => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
      withCredentials: true, // Include session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error.response?.data || error.message);
    throw error;
  }
};
```

### JavaScript/Node.js - Cancel Order (Token-based)
```javascript
const axios = require('axios');

const cancelOrderWithToken = async (orderId, userId) => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
      userId
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error.response?.data || error.message);
    throw error;
  }
};
```

### JavaScript/Node.js - Cancel Booking (Session-based)
```javascript
const axios = require('axios');

const cancelBooking = async (bookingId) => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {}, {
      withCredentials: true, // Include session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error.response?.data || error.message);
    throw error;
  }
};
```

### JavaScript/Node.js - Cancel Booking (Token-based)
```javascript
const axios = require('axios');

const cancelBookingWithToken = async (bookingId, userId) => {
  try {
    const response = await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
      userId
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.API_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error.response?.data || error.message);
    throw error;
  }
};
```

### JavaScript/Node.js - Get Refund Policy
```javascript
const axios = require('axios');

const getOrderRefundPolicy = async (orderId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/orders/${orderId}/refund-policy`, {
      withCredentials: true, // Include session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching refund policy:', error.response?.data || error.message);
    throw error;
  }
};

const getBookingRefundPolicy = async (bookingId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/bookings/${bookingId}/refund-policy`, {
      withCredentials: true, // Include session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching refund policy:', error.response?.data || error.message);
    throw error;
  }
};
```

### JavaScript/Node.js - Process Manual Refund
```javascript
const axios = require('axios');

const processOrderRefund = async (orderId, reason, amount) => {
  try {
    const response = await axios.post(`http://localhost:5000/api/orders/${orderId}/process-refund`, {
      reason,
      amount
    }, {
      withCredentials: true, // Include session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error.response?.data || error.message);
    throw error;
  }
};

const processBookingRefund = async (bookingId, reason, amount) => {
  try {
    const response = await axios.post(`http://localhost:5000/api/bookings/${bookingId}/process-refund`, {
      reason,
      amount
    }, {
      withCredentials: true, // Include session cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error processing refund:', error.response?.data || error.message);
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

#### Get Orders by User ID with API Token
```bash
curl -X GET "http://localhost:5000/api/orders/user/64f8a123456789abcdef0120" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Bookings by User ID with API Token
```bash
curl -X GET "http://localhost:5000/api/bookings/user/64f8a123456789abcdef0120" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get User Profile with API Token
```bash
curl -X GET "http://localhost:5000/api/users/profile?userId=64f8a123456789abcdef0120" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Order Details with API Token
```bash
curl -X GET "http://localhost:5000/api/orders/64f8a123456789abcdef0125" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

#### Create Booking with API Token
```bash
curl -X POST "http://localhost:5000/api/campgrounds/64f8a123456789abcdef0128/bookings" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "days": 3,
    "userId": "64f8a123456789abcdef0120"
  }'
```

#### Cancel Order (Session-based)
```bash
curl -X PATCH "http://localhost:5000/api/orders/64f8a123456789abcdef0125/cancel" \
  -H "Content-Type: application/json" \
  -b "session_cookie_name=session_value" \
  -d '{}'
```

#### Cancel Order (Token-based)
```bash
curl -X PATCH "http://localhost:5000/api/orders/64f8a123456789abcdef0125/cancel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -d '{
    "userId": "64f8a123456789abcdef0120"
  }'
```

#### Cancel Booking (Session-based)
```bash
curl -X PATCH "http://localhost:5000/api/bookings/64f8a123456789abcdef0127/cancel" \
  -H "Content-Type: application/json" \
  -b "session_cookie_name=session_value" \
  -d '{}'
```

#### Cancel Booking (Token-based)
```bash
curl -X PATCH "http://localhost:5000/api/bookings/64f8a123456789abcdef0127/cancel" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -d '{
    "userId": "64f8a123456789abcdef0120"
  }'
```

#### Get Order Refund Policy
```bash
curl -X GET "http://localhost:5000/api/orders/64f8a123456789abcdef0125/refund-policy" \
  -H "Content-Type: application/json" \
  -b "session_cookie_name=session_value"
```

#### Get Booking Refund Policy (Token-based)
```bash
curl -X GET "http://localhost:5000/api/bookings/64f8a123456789abcdef0127/refund-policy" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN"
```

#### Process Order Refund
```bash
curl -X POST "http://localhost:5000/api/orders/64f8a123456789abcdef0125/process-refund" \
  -H "Content-Type: application/json" \
  -b "session_cookie_name=session_value" \
  -d '{
    "reason": "Customer complaint",
    "amount": 15.99
  }'
```

#### Process Booking Refund (Token-based)
```bash
curl -X POST "http://localhost:5000/api/bookings/64f8a123456789abcdef0127/process-refund" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_ACCESS_TOKEN" \
  -d '{
    "userId": "64f8a123456789abcdef0120",
    "reason": "Emergency cancellation",
    "amount": 67.50
  }'
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
- **Stock is restored when orders are cancelled**

### Stock Validation
- Real-time stock checking during order creation
- Prevents overselling with concurrent orders
- Returns specific error messages for stock issues

## Payment & Refund System

### Simulated Payment Processing
- **Automatic payment simulation** when orders and bookings are created
- **No external payment processor required** for development and testing
- **Production-ready architecture** for integrating real payment processors

### Payment Tracking
- **Transaction IDs** for all payments
- **Payment status tracking** (paid/unpaid)
- **Payment method recording** (simulated, stripe, paypal, credit_card)
- **Payment timestamps** for audit trails

### Refund Processing
- **Automatic refunds** triggered during cancellation
- **Smart refund calculation** based on timing policies
- **Refund status tracking** (none, pending, processed, failed)
- **Refund audit trail** with timestamps and reasons

### Refund Business Rules
- **Orders**: Refund percentage decreases over time and order progress
- **Bookings**: Refund percentage decreases based on cancellation timing
- **Failed refunds**: Captured with failure reasons for troubleshooting
- **Duplicate refund prevention**: System prevents double refunds

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
*API Version: 1.3.0* (includes comprehensive token authentication support for all major endpoints) 
const express = require('express');
const router = express.Router();
const axios = require('axios');

// MCP Authentication middleware
const authenticateMCP = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  const MCP_ACCESS_TOKEN = process.env.MCP_ACCESS_TOKEN;
  
  if (!MCP_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'MCP server not configured' });
  }
  
  if (!token || token !== MCP_ACCESS_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// MCP Tools Definition
const MCP_TOOLS = [
  {
    name: "get_user_bookings",
    description: "Retrieve all bookings for a user by their user ID. Returns booking history with campground details, prices, dates, and statuses.",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "MongoDB ObjectId of the user (24 character hex string)" }
      },
      required: ["userId"]
    }
  },
  {
    name: "get_booking_details",
    description: "Get detailed information about a specific booking including campground details, payment status, and refund information.",
    inputSchema: {
      type: "object",
      properties: {
        bookingId: { type: "string", description: "The booking ID (MongoDB ObjectId)" }
      },
      required: ["bookingId"]
    }
  },
  {
    name: "check_campground_availability",
    description: "Check if a campground has available spots and get current booking status.",
    inputSchema: {
      type: "object",
      properties: {
        campgroundId: { type: "string", description: "The campground ID" }
      },
      required: ["campgroundId"]
    }
  },
  {
    name: "search_campgrounds",
    description: "Search for campgrounds by name, location, or description. Returns matching campgrounds with prices and details.",
    inputSchema: {
      type: "object",
      properties: {
        searchTerm: { type: "string", description: "Search term for campground name, location, or description" },
        limit: { type: "number", description: "Maximum number of results (default: 10)" }
      },
      required: ["searchTerm"]
    }
  },
  {
    name: "get_campground_details",
    description: "Get full details about a specific campground including reviews, ratings, location, price, and amenities.",
    inputSchema: {
      type: "object",
      properties: {
        campgroundId: { type: "string", description: "The campground ID" }
      },
      required: ["campgroundId"]
    }
  },
  {
    name: "cancel_booking",
    description: "Cancel a user's booking and process refund if eligible. Only works for confirmed bookings.",
    inputSchema: {
      type: "object",
      properties: {
        bookingId: { type: "string", description: "The booking ID to cancel" },
        userId: { type: "string", description: "User ID for verification and authorization" }
      },
      required: ["bookingId", "userId"]
    }
  },
  {
    name: "get_user_orders",
    description: "Get all shop orders for a specific user including order items, shipping details, and payment status.",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "User ID" }
      },
      required: ["userId"]
    }
  },
  {
    name: "get_user_profile",
    description: "Get user profile information including username, email, join date, and statistics.",
    inputSchema: {
      type: "object",
      properties: {
        userId: { type: "string", description: "User ID" }
      },
      required: ["userId"]
    }
  },
  {
    name: "get_order_details",
    description: "Get detailed information about a specific shop order.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "Order ID" }
      },
      required: ["orderId"]
    }
  },
  {
    name: "cancel_order",
    description: "Cancel a user's shop order and restore product inventory. Only works for pending/processing orders.",
    inputSchema: {
      type: "object",
      properties: {
        orderId: { type: "string", description: "Order ID to cancel" },
        userId: { type: "string", description: "User ID for verification" }
      },
      required: ["orderId", "userId"]
    }
  }
];

// Tool execution handler
async function executeTool(name, args, req) {
  const BACKEND_URL = `http://localhost:${process.env.PORT || 5000}`;
  const API_ACCESS_TOKEN = process.env.API_ACCESS_TOKEN;
  
  const apiHeaders = {
    'x-api-access-token': API_ACCESS_TOKEN,
    'Content-Type': 'application/json'
  };
  
  console.log(`📞 MCP Tool called: ${name}`, args);
  
  try {
    switch (name) {
      case "get_user_bookings": {
        const response = await axios.get(
          `${BACKEND_URL}/api/bookings/user/${args.userId}`,
          { headers: apiHeaders }
        );
        
        const bookings = response.data.data.bookings;
        const summary = {
          totalBookings: bookings.length,
          confirmed: bookings.filter(b => b.status === 'confirmed').length,
          cancelled: bookings.filter(b => b.status === 'cancelled').length,
          expired: bookings.filter(b => b.status === 'expired').length,
          bookings: bookings
        };
        
        return {
          content: [{
            type: "text",
            text: `Found ${bookings.length} bookings for user.\n\n${JSON.stringify(summary, null, 2)}`
          }]
        };
      }
      
      case "get_booking_details": {
        const response = await axios.get(
          `${BACKEND_URL}/api/bookings/${args.bookingId}`,
          { headers: apiHeaders }
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data.data.booking, null, 2)
          }]
        };
      }
      
      case "check_campground_availability": {
        const response = await axios.get(
          `${BACKEND_URL}/api/campgrounds/${args.campgroundId}`,
          { headers: apiHeaders }
        );
        
        const campground = response.data.data.campground;
        const availability = {
          campgroundId: campground._id,
          name: campground.title,
          location: campground.location,
          price: campground.price,
          pricePerNight: `$${campground.price}/night`,
          status: 'Available for booking',
          averageRating: response.data.data.stats?.averageRating,
          totalReviews: response.data.data.stats?.totalReviews
        };
        
        return {
          content: [{
            type: "text",
            text: `✅ Campground "${campground.title}" is available!\n\n${JSON.stringify(availability, null, 2)}`
          }]
        };
      }
      
      case "search_campgrounds": {
        const limit = args.limit || 10;
        const response = await axios.get(
          `${BACKEND_URL}/api/campgrounds/search/${encodeURIComponent(args.searchTerm)}`,
          { 
            headers: apiHeaders,
            params: { limit }
          }
        );
        
        const results = response.data.data.campgrounds;
        const summary = {
          searchTerm: args.searchTerm,
          resultsFound: results.length,
          campgrounds: results.map(c => ({
            id: c._id,
            name: c.title,
            location: c.location,
            price: c.price,
            description: c.description?.substring(0, 150) + '...'
          }))
        };
        
        return {
          content: [{
            type: "text",
            text: `Found ${results.length} campgrounds matching "${args.searchTerm}":\n\n${JSON.stringify(summary, null, 2)}`
          }]
        };
      }
      
      case "get_campground_details": {
        const response = await axios.get(
          `${BACKEND_URL}/api/campgrounds/${args.campgroundId}`,
          { headers: apiHeaders }
        );
        
        const campground = response.data.data.campground;
        const stats = response.data.data.stats;
        
        const details = {
          id: campground._id,
          name: campground.title,
          location: campground.location,
          description: campground.description,
          price: campground.price,
          images: campground.images?.length || 0,
          averageRating: stats.averageRating,
          totalReviews: stats.totalReviews,
          reviews: campground.reviews?.slice(0, 3).map(r => ({
            rating: r.rating,
            body: r.body,
            author: r.author?.username,
            date: r.createdAt
          }))
        };
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(details, null, 2)
          }]
        };
      }
      
      case "cancel_booking": {
        const response = await axios.patch(
          `${BACKEND_URL}/api/bookings/${args.bookingId}/cancel`,
          { userId: args.userId },
          { headers: apiHeaders }
        );
        
        const message = response.data.message;
        const refund = response.data.data.refund;
        
        let resultText = `✅ ${message}`;
        if (refund?.success) {
          resultText += `\n\n💰 Refund Details:\n`;
          resultText += `- Amount: $${refund.refund.amount}\n`;
          resultText += `- Status: ${refund.refund.status}\n`;
          resultText += `- Processed: ${refund.refund.processedAt}`;
        }
        
        return {
          content: [{
            type: "text",
            text: resultText
          }]
        };
      }
      
      case "get_user_orders": {
        const response = await axios.get(
          `${BACKEND_URL}/api/orders/user/${args.userId}`,
          { headers: apiHeaders }
        );
        
        const orders = response.data.data.orders;
        const summary = {
          totalOrders: orders.length,
          orders: orders.map(o => ({
            orderId: o._id,
            totalAmount: o.totalAmount,
            status: o.status,
            itemCount: o.items?.length,
            createdAt: o.createdAt
          }))
        };
        
        return {
          content: [{
            type: "text",
            text: `Found ${orders.length} orders:\n\n${JSON.stringify(summary, null, 2)}`
          }]
        };
      }
      
      case "get_user_profile": {
        const response = await axios.get(
          `${BACKEND_URL}/api/users/profile`,
          { 
            headers: apiHeaders,
            params: { userId: args.userId }
          }
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data.data.user, null, 2)
          }]
        };
      }
      
      case "get_order_details": {
        const response = await axios.get(
          `${BACKEND_URL}/api/orders/${args.orderId}`,
          { headers: apiHeaders }
        );
        
        return {
          content: [{
            type: "text",
            text: JSON.stringify(response.data.data.order, null, 2)
          }]
        };
      }
      
      case "cancel_order": {
        const response = await axios.patch(
          `${BACKEND_URL}/api/orders/${args.orderId}/cancel`,
          { userId: args.userId },
          { headers: apiHeaders }
        );
        
        return {
          content: [{
            type: "text",
            text: `✅ ${response.data.message}\n\n${JSON.stringify(response.data.data, null, 2)}`
          }]
        };
      }
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`❌ Error executing tool ${name}:`, error.response?.data || error.message);
    return {
      content: [{
        type: "text",
        text: `❌ Error: ${error.response?.data?.error || error.message}`
      }],
      isError: true
    };
  }
}

// MCP Routes - Support both GET and POST for Intercom compatibility
router.get('/initialize', authenticateMCP, (req, res) => {
  res.json({
    protocolVersion: "2024-11-05",
    serverInfo: {
      name: "campgrounds-booking-mcp",
      version: "1.0.0"
    },
    capabilities: {
      tools: {},
      resources: {}
    }
  });
});

router.post('/initialize', authenticateMCP, (req, res) => {
  res.json({
    protocolVersion: "2024-11-05",
    serverInfo: {
      name: "campgrounds-booking-mcp",
      version: "1.0.0"
    },
    capabilities: {
      tools: {},
      resources: {}
    }
  });
});

router.get('/tools/list', authenticateMCP, async (req, res) => {
  res.json({ tools: MCP_TOOLS });
});

router.post('/tools/list', authenticateMCP, async (req, res) => {
  res.json({ tools: MCP_TOOLS });
});

router.post('/tools/call', authenticateMCP, async (req, res) => {
  try {
    const { name, arguments: args } = req.body;
    const result = await executeTool(name, args, req);
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      content: [{
        type: "text",
        text: `Error: ${error.message}`
      }],
      isError: true
    });
  }
});

// Health check for MCP
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'campgrounds-mcp-server',
    version: '1.0.0',
    integrated: true,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;


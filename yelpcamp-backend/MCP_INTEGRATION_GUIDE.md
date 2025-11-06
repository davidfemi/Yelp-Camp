# MCP Integration Guide

Complete guide for implementing Model Context Protocol (MCP) integration with Intercom for The Campgrounds platform.

## Overview

This integration provides **bidirectional communication** between The Campgrounds and Intercom:

1. **MCP Server** (Intercom → Campgrounds): Allows Intercom's AI (Fin) to query and act on your data
2. **MCP Client** (Campgrounds → Intercom): Allows your app to programmatically access Intercom data

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Intercom AI   │ ◄─────► │  MCP Server      │ ◄─────► │  Your Backend   │
│   (Fin)         │  HTTP   │  (Port 3001)     │   API   │  (Port 5000)    │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                                                   │
                                                                   │
                            ┌──────────────────┐                  │
                            │  MCP Client      │ ◄────────────────┘
                            │  Service         │
                            └──────────────────┘
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  Intercom API    │
                            │  (REST/MCP)      │
                            └──────────────────┘
```

## Part 1: MCP Server Setup

### What It Does
Exposes your campground booking system to Intercom, allowing their AI to:
- Look up user bookings
- Cancel reservations
- Search campgrounds
- Check availability
- Access user profiles

### Location
`yelpcamp-backend/mcp-server/`

### Installation

```bash
cd yelpcamp-backend/mcp-server
npm install
```

### Configuration

Create `.env` file:

```env
MCP_PORT=3001
BACKEND_API_URL=http://localhost:5000
MCP_ACCESS_TOKEN=generate_secure_random_token_here
API_ACCESS_TOKEN=your_backend_api_token
NODE_ENV=production
```

Generate secure token:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Running

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

### Available Tools

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `get_user_bookings` | Get all bookings for a user | `userId` |
| `get_booking_details` | Get specific booking details | `bookingId` |
| `check_campground_availability` | Check campground availability | `campgroundId` |
| `search_campgrounds` | Search campgrounds | `searchTerm`, `limit` |
| `get_campground_details` | Get campground details + reviews | `campgroundId` |
| `cancel_booking` | Cancel booking + refund | `bookingId`, `userId` |
| `get_user_orders` | Get user's shop orders | `userId` |
| `get_user_profile` | Get user profile + stats | `userId` |
| `get_order_details` | Get order details | `orderId` |
| `cancel_order` | Cancel order + restore stock | `orderId`, `userId` |

### Testing

```bash
# Health check
curl http://localhost:3001/health

# List tools
curl -X POST http://localhost:3001/mcp/tools/list \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Search campgrounds
curl -X POST http://localhost:3001/mcp/tools/call \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_campgrounds",
    "arguments": {"searchTerm": "lake", "limit": 5}
  }'
```

## Part 2: MCP Client Setup

### What It Does
Allows your backend to connect to Intercom's MCP (if available) or use REST API fallback to:
- Track events in Intercom
- Update user attributes
- Sync booking/order data

### Location
`yelpcamp-backend/services/intercomMCPClient.ts`
`yelpcamp-backend/controllers/intercomSync.js`

### Configuration

Add to main backend `.env`:

```env
# Intercom MCP Configuration
INTERCOM_MCP_URL=https://api.intercom.io/mcp
INTERCOM_ACCESS_TOKEN=your_intercom_access_token
```

### Usage in Backend

The client is automatically used when bookings/orders are created. You can also use it manually:

```javascript
const { getIntercomMCPClient } = require('./services/intercomMCPClient');
const intercomClient = getIntercomMCPClient();

// Track event
await intercomClient.trackEventViaAPI(
  userId,
  'booking_created',
  { booking_id: bookingId, total_price: 150 }
);

// Update user
await intercomClient.updateUserViaAPI({
  user_id: userId,
  email: 'user@example.com',
  custom_attributes: {
    total_bookings: 5,
    total_value: 750
  }
});
```

### Auto-Sync Features

Automatically syncs to Intercom:
- ✅ Booking created
- ✅ Booking cancelled
- ✅ Order created
- ✅ User profile updates

## Part 3: Connecting to Intercom

### Prerequisites
1. MCP server deployed and publicly accessible
2. Intercom workspace with Fin AI enabled
3. Admin access to Intercom settings

### Steps

1. **Deploy MCP Server**
   - Use Render, Railway, Heroku, or AWS
   - Note your deployment URL (e.g., `https://your-mcp.onrender.com`)

2. **Configure Intercom**
   - Go to **Settings** → **Integrations** → **Data connectors**
   - Click **Custom MCP**
   - Enter:
     - Name: `Campgrounds Booking System`
     - Base URL: `https://your-mcp.onrender.com/mcp`
     - Access Token: Your `MCP_ACCESS_TOKEN`
   - Click **Add MCP Server**

3. **Enable Tools**
   - Click **+ New** under your MCP server
   - Select tools you want Fin to use
   - Test each tool
   - Set them live

4. **Test Integration**
   - Open Intercom messenger
   - Ask Fin: "Show me bookings for user ID 507f1f77bcf86cd799439011"
   - Fin should query your MCP server and return results

## Use Cases

### Support Agent Scenarios

**Customer asks: "What bookings do I have?"**
```
Fin → MCP Server → get_user_bookings(userId)
     ← Returns booking list
Fin → Shows formatted booking details to customer
```

**Customer asks: "Is Yosemite Valley available next week?"**
```
Fin → MCP Server → search_campgrounds("Yosemite")
     ← Returns campground list
Fin → MCP Server → check_campground_availability(campgroundId)
     ← Returns availability status
Fin → Confirms availability to customer
```

**Customer asks: "Cancel my booking #abc123"**
```
Fin → MCP Server → cancel_booking(bookingId, userId)
     ← Processes cancellation + refund
Fin → Confirms cancellation and refund amount
```

### Automated Workflows

1. **Auto-sync booking data** when created
2. **Update user attributes** with lifetime value
3. **Track events** for customer journey analysis
4. **Trigger messages** based on booking status

## Security Considerations

✅ **Authentication**: Bearer token required for all MCP requests
✅ **Authorization**: User ID verification for sensitive operations
✅ **No Direct DB Access**: All queries go through authenticated API
✅ **Rate Limiting**: Consider adding rate limits in production
✅ **Audit Logging**: All MCP calls are logged
✅ **Token Rotation**: Regularly rotate access tokens

## Deployment Checklist

- [ ] MCP server running locally successfully
- [ ] All environment variables configured
- [ ] Backend API accessible from MCP server
- [ ] MCP server deployed to production hosting
- [ ] Public URL accessible via HTTPS
- [ ] Access tokens generated and secured
- [ ] Intercom connected to MCP server
- [ ] Tools tested and enabled in Intercom
- [ ] Auto-sync working for bookings/orders
- [ ] Monitoring and logging configured

## Troubleshooting

### MCP Server Issues

**"Error: MCP_ACCESS_TOKEN is required"**
- Set `MCP_ACCESS_TOKEN` in `.env` file

**"Connection refused to backend"**
- Check `BACKEND_API_URL` is correct
- Ensure backend is running and accessible
- Verify `API_ACCESS_TOKEN` is valid

**"401 Unauthorized from backend"**
- Verify `API_ACCESS_TOKEN` matches backend's token
- Check backend middleware accepts the token

### Intercom Connection Issues

**"Failed to connect to MCP server"**
- Verify MCP server is publicly accessible
- Test with: `curl https://your-mcp-server.com/health`
- Check firewall/security group settings

**"Tools not showing in Intercom"**
- Ensure MCP server is responding to `/mcp/tools/list`
- Check authentication token is correct
- Review Intercom's MCP configuration

**"Tool execution fails"**
- Check MCP server logs for errors
- Verify tool parameters are correct
- Ensure backend API is responding

### Auto-Sync Issues

**"Events not appearing in Intercom"**
- Verify `INTERCOM_ACCESS_TOKEN` is set
- Check Intercom API credentials are valid
- Review backend logs for sync errors

## Monitoring

### Metrics to Track
- MCP tool call volume
- Success/failure rates
- Response times
- Error types and frequency
- User satisfaction with AI responses

### Logging
The MCP server logs:
- All incoming requests
- Tool calls with parameters
- Backend API responses
- Errors with stack traces

## Performance Optimization

1. **Cache frequently accessed data** (campground details, user profiles)
2. **Implement request queuing** for high-volume periods
3. **Add Redis caching** for search results
4. **Set up CDN** for MCP server if global audience
5. **Monitor response times** and optimize slow queries

## Future Enhancements

- [ ] Add real-time webhooks from Intercom
- [ ] Implement conversation context persistence
- [ ] Add natural language date parsing
- [ ] Create custom workflows for common tasks
- [ ] Add analytics dashboard for MCP usage
- [ ] Implement A/B testing for AI responses

## Support

For issues or questions:
1. Check the relevant README files
2. Review logs in both MCP server and backend
3. Test endpoints manually with curl
4. Verify all environment variables are set correctly

## Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Intercom Developer Docs](https://developers.intercom.com)
- [MCP SDK on npm](https://www.npmjs.com/package/@modelcontextprotocol/sdk)

---

**Last Updated**: November 5, 2025
**Version**: 1.0.0


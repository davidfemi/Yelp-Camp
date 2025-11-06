# Campgrounds MCP Server

Model Context Protocol (MCP) server for The Campgrounds booking system. This server enables Intercom's AI assistant (Fin) to access and interact with your campground booking data.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that allows AI assistants to securely connect to external data sources and tools. This server exposes your campground booking system's functionality through MCP, enabling Intercom's AI to:

- Look up user bookings
- Check campground availability
- Search for campgrounds
- Cancel bookings and orders
- Access user profiles and order history

## Features

### Available Tools

1. **get_user_bookings** - Get all bookings for a user
2. **get_booking_details** - Get detailed booking information
3. **check_campground_availability** - Check if campground has spots available
4. **search_campgrounds** - Search campgrounds by name/location
5. **get_campground_details** - Get full campground details with reviews
6. **cancel_booking** - Cancel a booking and process refund
7. **get_user_orders** - Get user's shop orders
8. **get_user_profile** - Get user profile with stats
9. **get_order_details** - Get detailed order information
10. **cancel_order** - Cancel an order and restore inventory

## Installation

```bash
cd yelpcamp-backend/mcp-server
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` and set:

```env
MCP_PORT=3001
BACKEND_API_URL=http://localhost:5000  # Your backend API URL
MCP_ACCESS_TOKEN=your_secure_random_token_here
API_ACCESS_TOKEN=your_backend_api_token
```

### Generating Secure Tokens

Generate a secure MCP access token:

```bash
# On macOS/Linux
openssl rand -hex 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start server
npm start
```

The server will start on port 3001 (or the port specified in `.env`).

## Testing the Server

### Health Check

```bash
curl http://localhost:3001/health
```

### List Available Tools

```bash
curl -X POST http://localhost:3001/mcp/tools/list \
  -H "Authorization: Bearer YOUR_MCP_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Call a Tool

```bash
curl -X POST http://localhost:3001/mcp/tools/call \
  -H "Authorization: Bearer YOUR_MCP_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_campgrounds",
    "arguments": {
      "searchTerm": "Yosemite",
      "limit": 5
    }
  }'
```

## Connecting to Intercom

1. **Deploy your MCP server** to a hosting service (Render, Railway, Heroku, AWS, etc.)

2. **Get your deployment URL** (e.g., `https://your-mcp-server.onrender.com`)

3. **In Intercom Dashboard:**
   - Go to **Settings** → **Integrations** → **Data connectors**
   - Click **Custom MCP**
   - Fill in:
     - **Name**: "Campgrounds Booking System"
     - **Base URL**: `https://your-mcp-server.onrender.com/mcp`
     - **Access Token**: Your `MCP_ACCESS_TOKEN` from `.env`
   - Click **Add MCP Server**

4. **Configure Tools:**
   - Click **+ New** under your server
   - Select which tools Fin (Intercom's AI) can use
   - Test each tool
   - Set them live

## Deployment

### Deploy to Render

1. Create a new Web Service on Render
2. Connect your repository
3. Set:
   - **Build Command**: `cd yelpcamp-backend/mcp-server && npm install && npm run build`
   - **Start Command**: `cd yelpcamp-backend/mcp-server && npm start`
   - **Environment Variables**: Add all variables from `.env`

### Deploy to Railway

```bash
railway login
railway init
railway up
```

Add environment variables in Railway dashboard.

### Deploy to Heroku

```bash
# From mcp-server directory
heroku create your-mcp-server-name
git subtree push --prefix yelpcamp-backend/mcp-server heroku main
heroku config:set MCP_ACCESS_TOKEN=your_token
heroku config:set API_ACCESS_TOKEN=your_backend_token
heroku config:set BACKEND_API_URL=your_backend_url
```

## Security

- **Authentication Required**: All MCP endpoints require Bearer token authentication
- **CORS Enabled**: Allows connections from Intercom
- **API Token**: Uses your backend's API token for authenticated requests
- **No Direct Database Access**: All data access goes through your backend API

## Troubleshooting

### Server won't start

- Check that all required environment variables are set
- Verify ports are not already in use
- Check logs for specific errors

### Tools not working

- Verify `BACKEND_API_URL` is correct and accessible
- Check that `API_ACCESS_TOKEN` matches your backend's token
- Ensure your backend API is running
- Check backend logs for API errors

### Intercom connection fails

- Verify your MCP server is publicly accessible
- Check that the correct `MCP_ACCESS_TOKEN` is configured in Intercom
- Test the `/health` endpoint from Intercom's network
- Check server logs for authentication errors

## Monitoring

The server logs all tool calls and errors. In production, consider adding:

- Log aggregation (Datadog, LogDNA, etc.)
- Error tracking (Sentry, Rollbar)
- Uptime monitoring (UptimeRobot, Pingdom)

## Support

For issues or questions:
1. Check the logs: `npm run dev` shows detailed logs
2. Test tools manually using curl
3. Verify backend API is responding correctly

## License

MIT


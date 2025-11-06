# MCP Integration Quick Start Guide

Get your MCP integration running in 5 minutes!

## 🎯 What You've Got

Two powerful MCP integrations:
1. **MCP Server** - Lets Intercom's AI query your booking data
2. **MCP Client** - Lets your app sync data to Intercom

## ⚡ Quick Setup

### Step 1: Install Dependencies

```bash
# Backend dependencies (includes MCP SDK)
cd yelpcamp-backend
npm install

# MCP Server dependencies
cd mcp-server
npm install
```

### Step 2: Configure Environment Variables

**Main Backend** (`yelpcamp-backend/.env`):
```env
# Add these new variables
INTERCOM_ACCESS_TOKEN=your_intercom_token_here
INTERCOM_MCP_URL=https://api.intercom.io/mcp
API_ACCESS_TOKEN=your_backend_api_token
```

**MCP Server** (`yelpcamp-backend/mcp-server/.env`):
```env
MCP_PORT=3001
BACKEND_API_URL=http://localhost:5000
MCP_ACCESS_TOKEN=<generate-random-token>
API_ACCESS_TOKEN=<same-as-backend>
```

**Generate tokens:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start Services

**Option A - Start All at Once:**
```bash
# From project root
./start-all-services.sh
```

**Option B - Start Individually:**
```bash
# Terminal 1: Backend
cd yelpcamp-backend
npm start

# Terminal 2: MCP Server
cd yelpcamp-backend/mcp-server
npm run dev
```

### Step 4: Test It Works

```bash
# Test MCP Server health
curl http://localhost:3001/health

# Test MCP Server authentication
curl -X POST http://localhost:3001/mcp/tools/list \
  -H "Authorization: Bearer YOUR_MCP_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "tools": [
    {
      "name": "get_user_bookings",
      "description": "Retrieve all bookings for a user..."
    }
    // ... more tools
  ]
}
```

## 🚀 Deploy to Production

### Deploy MCP Server (Render Example)

1. **Create Web Service** on Render
2. **Connect** your GitHub repository
3. **Configure:**
   - Root Directory: `yelpcamp-backend/mcp-server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: Copy from `.env`

4. **Deploy** and note your URL: `https://your-mcp.onrender.com`

### Connect to Intercom

1. **Open Intercom** → Settings → Integrations → Data connectors
2. **Click** "Custom MCP"
3. **Enter:**
   - Name: `Campgrounds Booking System`
   - Base URL: `https://your-mcp.onrender.com/mcp`
   - Access Token: Your `MCP_ACCESS_TOKEN`
4. **Add MCP Server**
5. **Configure Tools:**
   - Click "+ New" under your server
   - Select tools for Fin to use
   - Test and set live

## 🎮 Usage Examples

### In Intercom Chat

Customer can ask Fin:
- "What bookings do I have?"
- "Is Yosemite campground available?"
- "Cancel my booking #abc123"

Fin will use your MCP server to answer!

### Programmatic Sync

Your backend automatically syncs:
```javascript
// When booking is created
syncBookingToIntercom(booking, user);

// When order is placed
syncOrderToIntercom(order, user);
```

Manual sync:
```bash
curl -X POST http://localhost:5000/api/intercom/sync/USER_ID \
  -H "x-api-access-token: YOUR_TOKEN"
```

## 🔧 Available MCP Tools

| Tool | What It Does |
|------|--------------|
| `get_user_bookings` | Get all user bookings |
| `get_booking_details` | Get specific booking |
| `search_campgrounds` | Search for campgrounds |
| `check_campground_availability` | Check availability |
| `cancel_booking` | Cancel booking + refund |
| `get_user_profile` | Get user info + stats |
| `get_user_orders` | Get shop orders |
| `cancel_order` | Cancel order + restock |

## 📊 Auto-Sync Features

Your backend now automatically syncs to Intercom:

✅ **Booking Created** → Tracks event in Intercom  
✅ **Order Placed** → Tracks event in Intercom  
✅ **User Updates** → Syncs profile attributes  

## 🐛 Troubleshooting

### MCP Server Won't Start
```bash
# Check environment variables
cat yelpcamp-backend/mcp-server/.env

# Check if port is in use
lsof -i :3001

# View logs
cd yelpcamp-backend/mcp-server
npm run dev
```

### Intercom Can't Connect
- Verify MCP server is publicly accessible
- Check firewall/security groups
- Test: `curl https://your-mcp.onrender.com/health`
- Verify access token matches

### Auto-Sync Not Working
- Check `INTERCOM_ACCESS_TOKEN` is set in backend `.env`
- Check backend logs for sync errors
- Verify Intercom API credentials

## 📚 Full Documentation

- **MCP Server**: `yelpcamp-backend/mcp-server/README.md`
- **Complete Guide**: `MCP_INTEGRATION_GUIDE.md`
- **Environment Setup**: `yelpcamp-backend/mcp-server/ENV_SETUP.md`

## 🔐 Security Checklist

- [ ] Generated secure random tokens
- [ ] Different tokens for dev/production
- [ ] Tokens stored in environment variables (not code)
- [ ] `.env` files in `.gitignore`
- [ ] Production secrets in hosting platform
- [ ] MCP server uses HTTPS in production

## 🎯 Next Steps

1. ✅ Start services locally
2. ✅ Test MCP tools with curl
3. ✅ Deploy MCP server to production
4. ✅ Connect Intercom to your MCP server
5. ✅ Configure which tools Fin can use
6. ✅ Test in Intercom chat
7. ✅ Monitor auto-sync in logs
8. ✅ Set up error tracking (Sentry, etc.)

## 💡 Pro Tips

- **Monitor Usage**: Check MCP server logs for tool call volume
- **Rate Limiting**: Consider adding rate limits in production
- **Caching**: Cache frequently accessed data (campgrounds, etc.)
- **Error Tracking**: Set up Sentry or similar for MCP server
- **Analytics**: Track which MCP tools are most used

## 🆘 Get Help

1. Check the health endpoint: `/health`
2. Review logs in both backend and MCP server
3. Test endpoints manually with curl
4. Verify all environment variables are set
5. Check the full documentation guides

---

**Ready?** Start your services and connect to Intercom! 🚀

```bash
./start-all-services.sh
```


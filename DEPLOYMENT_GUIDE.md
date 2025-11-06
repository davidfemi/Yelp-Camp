# Deployment Guide - MCP Integration on Render

Since your backend is already deployed on Render, the MCP server is now **integrated into the same backend**. You only need to update your existing Render deployment!

## ✅ What Changed

Instead of deploying two separate services, the MCP server is now part of your backend:

```
Before: Backend (Port 5000) + MCP Server (Port 3001) = 2 deployments
After:  Backend (Port 5000) with MCP at /mcp/* = 1 deployment ✨
```

---

## 🚀 Deploy to Render (Update Existing Service)

### Step 1: Update Environment Variables

In your **existing Render backend service**, add this new environment variable:

```
MCP_ACCESS_TOKEN=9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98
```

**Where to add it:**
1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. Add: `MCP_ACCESS_TOKEN` with the value above

**Note:** Your `API_ACCESS_TOKEN` should already be set from before.

### Step 2: Deploy the Updates

Render will automatically deploy when you push to GitHub. Or manually trigger:

1. Go to **Manual Deploy** tab
2. Click **Deploy latest commit**
3. Wait for deployment to complete

### Step 3: Verify Deployment

Once deployed, test your MCP endpoints:

```bash
# Replace YOUR_RENDER_URL with your actual Render URL
# e.g., https://yelpcamp-vvv2.onrender.com

# Test health
curl https://YOUR_RENDER_URL.onrender.com/mcp/health

# Test tools list
curl -X POST https://YOUR_RENDER_URL.onrender.com/mcp/tools/list \
  -H "Authorization: Bearer 9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98" \
  -H "Content-Type: application/json"
```

---

## 🔗 Connect to Intercom

### Step 1: Get Your Render URL

Your MCP endpoint will be:
```
https://YOUR_RENDER_URL.onrender.com/mcp
```

Example:
```
https://yelpcamp-vvv2.onrender.com/mcp
```

### Step 2: Add to Intercom

1. **Log in to Intercom**
2. Go to **Settings** → **Integrations** → **Data connectors**
3. Click **Custom MCP** (or **Add MCP Server**)
4. Fill in:
   - **Name**: `Campgrounds Booking System`
   - **Base URL**: `https://yelpcamp-vvv2.onrender.com/mcp`
   - **Access Token**: `9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98`
5. Click **Add MCP Server**

### Step 3: Configure Tools

1. Click **+ New** under your MCP server
2. Select which tools you want Fin (Intercom's AI) to use:
   - ✅ `search_campgrounds` - Let customers search
   - ✅ `get_user_bookings` - Show user bookings
   - ✅ `check_campground_availability` - Check availability
   - ✅ `cancel_booking` - Cancel bookings
   - ✅ Others as needed
3. **Test** each tool
4. Click **Set Live**

---

## 📊 MCP Endpoints Available

All MCP endpoints are now on your backend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp/health` | GET | Health check |
| `/mcp/initialize` | POST | MCP protocol initialization |
| `/mcp/tools/list` | POST | List all available tools |
| `/mcp/tools/call` | POST | Execute a tool |

---

## 🔐 Security

### Authentication Required

All `/mcp/*` endpoints require Bearer token authentication:

```bash
Authorization: Bearer 9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98
```

### Environment Variables Needed

Make sure these are set in Render:

```env
# Existing variables (should already be set)
DB_URL=your_mongodb_connection_string
SECRET=your_session_secret
API_ACCESS_TOKEN=1c71ca3300851312e4c4da6aaf23ffa36840a766fe0b2b670b19186e5a79569b

# New variable for MCP
MCP_ACCESS_TOKEN=9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98

# Optional: Intercom configuration
INTERCOM_ACCESS_TOKEN=your_intercom_token
INTERCOM_MCP_URL=https://api.intercom.io/mcp
```

---

## ✅ Testing Checklist

After deployment, test these:

- [ ] Backend still works: `https://YOUR_RENDER_URL.onrender.com/api/stats`
- [ ] MCP health: `https://YOUR_RENDER_URL.onrender.com/mcp/health`
- [ ] MCP auth works (401 without token)
- [ ] MCP tools list returns all 10 tools
- [ ] Search tool works with real data
- [ ] Intercom can connect to MCP server
- [ ] Fin can execute tools successfully

---

## 🎯 Quick Test Commands

Replace `YOUR_RENDER_URL` with your actual URL:

### Test Health
```bash
curl https://YOUR_RENDER_URL.onrender.com/mcp/health
```

### Test Authentication
```bash
# Should return 401 Unauthorized
curl -X POST https://YOUR_RENDER_URL.onrender.com/mcp/tools/list \
  -H "Content-Type: application/json"
```

### Test Tools List (With Auth)
```bash
curl -X POST https://YOUR_RENDER_URL.onrender.com/mcp/tools/list \
  -H "Authorization: Bearer 9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98" \
  -H "Content-Type: application/json"
```

### Test Search Tool
```bash
curl -X POST https://YOUR_RENDER_URL.onrender.com/mcp/tools/call \
  -H "Authorization: Bearer 9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "search_campgrounds",
    "arguments": {
      "searchTerm": "lake",
      "limit": 3
    }
  }'
```

---

## 🐛 Troubleshooting

### Issue: 500 Error on MCP endpoints
**Solution:** Make sure `MCP_ACCESS_TOKEN` is set in Render environment variables

### Issue: 401 Unauthorized
**Solution:** Check that you're using the correct token in the Authorization header

### Issue: Tools return empty results
**Solution:** Verify backend database connection and API routes are working

### Issue: Intercom can't connect
**Solution:** 
- Verify Render URL is correct
- Check that service is running (not sleeping)
- Ensure HTTPS is used
- Verify token in Intercom matches environment variable

---

## 💡 Benefits of Integrated Approach

✅ **Single Deployment** - No need to manage separate MCP server
✅ **Lower Cost** - One service instead of two
✅ **Shared Resources** - Same database connection, environment variables
✅ **Simpler Setup** - Just update existing backend
✅ **Same Domain** - All on your Render URL

---

## 📝 Summary

1. ✅ MCP server integrated into backend
2. ✅ Add `MCP_ACCESS_TOKEN` to Render environment
3. ✅ Push/deploy your code to Render
4. ✅ Test MCP endpoints work
5. ✅ Connect Intercom to `https://YOUR_RENDER_URL.onrender.com/mcp`
6. ✅ Configure tools in Intercom
7. ✅ Start using with Fin!

---

**Ready to deploy!** Just add the environment variable and push your code. 🚀


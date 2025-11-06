# Connect Your MCP Server to Intercom

Your MCP server is **LIVE** on Render! Now let's connect it to Intercom so Fin (their AI assistant) can use your tools.

---

## 🔗 Your Production MCP Endpoint

```
https://yelpcamp-vvv2.onrender.com/mcp
```

---

## 🔑 Your Access Token

```
9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98
```

**Important:** Keep this token secure! It provides access to your booking system.

---

## 📋 Step-by-Step Connection Guide

### Step 1: Open Intercom Dashboard

1. Log in to your Intercom account at https://app.intercom.com
2. Click the **Settings** icon (⚙️) in the bottom left

### Step 2: Navigate to Integrations

1. In Settings, click **Integrations & Apps**
2. Look for **Data connectors** or **Custom integrations**
3. Click **Add connector** or **New integration**
4. Select **Custom MCP** (or **MCP Server**)

### Step 3: Configure Your MCP Server

Fill in the connection details:

**Server Name:**
```
Campgrounds Booking System
```

**Base URL:**
```
https://yelpcamp-vvv2.onrender.com/mcp
```

**Access Token:**
```
9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98
```

**Protocol Version:** (if asked)
```
2024-11-05
```

### Step 4: Test Connection

Click **Test Connection** or **Verify**

You should see:
- ✅ Connection successful
- ✅ 10 tools discovered

### Step 5: Configure Available Tools

Select which tools you want Fin to use:

**Recommended for Customer Support:**
- ✅ `search_campgrounds` - Let customers search for campgrounds
- ✅ `get_user_bookings` - Show user their bookings
- ✅ `get_booking_details` - Get specific booking information
- ✅ `check_campground_availability` - Check if campground is available
- ✅ `cancel_booking` - Allow booking cancellations

**Optional (for advanced support):**
- ⬜ `get_campground_details` - Show full campground info with reviews
- ⬜ `get_user_orders` - Show shop orders
- ⬜ `get_user_profile` - Get user profile information
- ⬜ `cancel_order` - Cancel shop orders

### Step 6: Set Tool Descriptions for Fin

For each tool, you can customize how Fin understands when to use it:

**search_campgrounds:**
> Use this when customer wants to find campgrounds by name, location, or features like "lake" or "mountain"

**get_user_bookings:**
> Use this when customer asks "what bookings do I have" or wants to see their reservations

**check_campground_availability:**
> Use this when customer asks if a specific campground is available for booking

**cancel_booking:**
> Use this when customer wants to cancel a reservation. Always confirm the booking ID first.

### Step 7: Test Each Tool

Before going live, test each tool:

1. Click **Test** next to each tool
2. Provide sample parameters
3. Verify results look correct

**Example Test for search_campgrounds:**
```json
{
  "searchTerm": "lake",
  "limit": 3
}
```

Expected: Should return 3 campgrounds with "lake" in name/location/description

### Step 8: Set Live

Once all tests pass:

1. Click **Set Live** or **Enable**
2. Confirm activation
3. Your MCP server is now connected! 🎉

---

## 🧪 Testing with Fin

After activation, test Fin's capabilities:

### Test 1: Search Campgrounds
**Ask Fin:** "Can you search for campgrounds near lakes?"

**Expected Response:**
- Fin uses `search_campgrounds` tool
- Returns list of lakeside campgrounds
- Shows names, locations, and prices

### Test 2: Get User Bookings
**Ask Fin:** "What bookings do I have?"

**Expected Response:**
- Fin uses `get_user_bookings` tool
- Shows user's booking history
- Includes dates, campgrounds, and status

### Test 3: Check Availability
**Ask Fin:** "Is Yosemite Valley campground available?"

**Expected Response:**
- Fin searches for the campground
- Uses `check_campground_availability`
- Confirms availability and price

### Test 4: Cancel Booking
**Ask Fin:** "I need to cancel my booking"

**Expected Response:**
- Fin asks for booking ID
- Uses `cancel_booking` tool
- Processes cancellation and refund

---

## 🎯 Common Use Cases

### Customer Self-Service

**Customer:** "Show me beach campgrounds under $30/night"
- Fin searches with `search_campgrounds`
- Filters results by price
- Returns matching options

**Customer:** "What's my upcoming reservation?"
- Fin gets bookings with `get_user_bookings`
- Shows confirmed reservations
- Provides booking details

### Support Agent Assistance

**Agent asks Fin:** "Get this user's booking history"
- Fin retrieves all bookings
- Shows cancellations, confirmations
- Highlights any issues

**Agent asks Fin:** "Cancel booking #abc123 for this customer"
- Fin processes cancellation
- Handles refund automatically
- Updates status

---

## 🔧 Advanced Configuration

### Rate Limiting (Optional)

Set limits if needed:
- **Requests per minute:** 60
- **Requests per hour:** 1000
- **Concurrent requests:** 10

### Error Notifications

Configure alerts for:
- ✅ Failed tool executions
- ✅ Authentication errors
- ✅ Slow response times (>2s)

### Usage Analytics

Monitor:
- Most used tools
- Average response time
- Success rate
- Error rate

---

## 📊 Monitoring Your Integration

### Check Connection Status

Regularly verify:
1. Go to Intercom → Integrations → Data connectors
2. Check your MCP server status
3. View recent activity log

### View Tool Usage

See which tools Fin uses most:
1. Click on your MCP server
2. View **Usage Statistics**
3. Analyze tool performance

### Test Periodically

Monthly testing recommended:
```bash
# Test health
curl https://yelpcamp-vvv2.onrender.com/mcp/health

# Test authentication
curl -X POST https://yelpcamp-vvv2.onrender.com/mcp/tools/list \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🐛 Troubleshooting

### Issue: "Connection Failed"

**Possible Causes:**
1. Render service is sleeping (free tier)
2. Wrong URL entered
3. Network firewall blocking

**Solution:**
- Wake up Render: Visit https://yelpcamp-vvv2.onrender.com/api/stats
- Verify URL: Must be exactly `https://yelpcamp-vvv2.onrender.com/mcp`
- Check Render logs for errors

### Issue: "Authentication Failed"

**Possible Causes:**
1. Wrong token entered
2. Token missing from Render environment variables
3. Token has spaces/newlines

**Solution:**
- Verify token in Intercom matches: `9eaaf63b00a7736c...`
- Check Render environment: `MCP_ACCESS_TOKEN` is set
- Re-copy token (no spaces)

### Issue: "Tools Not Working"

**Possible Causes:**
1. Backend database connection issue
2. API routes not responding
3. Missing permissions

**Solution:**
- Check backend logs in Render
- Verify database connection: `https://yelpcamp-vvv2.onrender.com/api/stats`
- Test tools manually with curl

### Issue: "Slow Response Times"

**Possible Causes:**
1. Render free tier cold starts
2. Database query optimization needed
3. Network latency

**Solution:**
- Upgrade to Render paid tier (prevents cold starts)
- Add database indexes for common queries
- Enable caching for frequent searches

---

## 💡 Best Practices

### 1. Tool Descriptions

Write clear descriptions for Fin:
- Be specific about when to use each tool
- Include example queries
- Mention any prerequisites

### 2. Error Messages

Make errors helpful:
- Include what went wrong
- Suggest next steps
- Provide booking IDs when relevant

### 3. Response Format

Keep responses concise:
- Highlight key information
- Use bullet points
- Include relevant IDs/numbers

### 4. Security

Protect your integration:
- Rotate tokens quarterly
- Monitor for unusual activity
- Set up alerts for failures
- Limit tool access as needed

### 5. Testing

Test regularly:
- Monthly tool verification
- Before major updates
- After any backend changes
- When adding new campgrounds

---

## 📞 Support Resources

### Intercom Support
- Help Center: https://www.intercom.com/help
- MCP Documentation: Check Intercom Developer Hub
- Support: Contact via Intercom dashboard

### Your Backend
- Render Dashboard: https://dashboard.render.com
- MCP Health: https://yelpcamp-vvv2.onrender.com/mcp/health
- API Status: https://yelpcamp-vvv2.onrender.com/api/stats

---

## ✅ Connection Checklist

Before marking as complete:

- [ ] Opened Intercom dashboard
- [ ] Navigated to Integrations
- [ ] Added Custom MCP connector
- [ ] Entered MCP URL correctly
- [ ] Entered access token correctly
- [ ] Connection test passed
- [ ] Configured desired tools
- [ ] Added tool descriptions
- [ ] Tested each tool individually
- [ ] Set integration live
- [ ] Tested with Fin AI assistant
- [ ] Verified customer can use tools
- [ ] Set up monitoring/alerts
- [ ] Documented any custom configurations

---

## 🎉 You're All Set!

Once connected, your customers and support team can:

✅ Search campgrounds instantly  
✅ Check availability in real-time  
✅ View booking history  
✅ Cancel bookings automatically  
✅ Get campground details with reviews  

**Your MCP integration is production-ready and waiting to transform your customer support!** 🚀

---

**Need Help?** Check your test results in `MCP_FINAL_TEST_REPORT.md` or test manually:
```bash
curl https://yelpcamp-vvv2.onrender.com/mcp/health
```


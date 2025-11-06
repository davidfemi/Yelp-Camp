# Intercom Integration Troubleshooting

## Error: "Failed to list tools"

### What Happened
Intercom couldn't list the available MCP tools from your server.

### Root Cause
The MCP routes only supported POST requests, but Intercom may use GET requests during the connection test phase.

### Fix Applied ✅
Updated `/yelpcamp-backend/routes/mcpRoutes.js` to support **both GET and POST** methods for:
- `/mcp/initialize`
- `/mcp/tools/list`

### After Deploying This Fix

1. **Push to GitHub:**
   ```bash
   git add yelpcamp-backend/routes/mcpRoutes.js
   git commit -m "Add GET method support for MCP endpoints"
   git push origin main
   ```

2. **Wait for Render to deploy** (auto-deploy, ~2-3 minutes)

3. **Verify the fix:**
   ```bash
   # Test GET method works
   curl https://yelpcamp-vvv2.onrender.com/mcp/tools/list \
     -H "Authorization: Bearer 9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98"
   ```

4. **Retry in Intercom:**
   - Go back to your MCP integration in Intercom
   - Click "Test Connection" again
   - Should now successfully discover 10 tools

---

## Common Intercom MCP Errors & Solutions

### Error 1: "Connection Failed"

**Possible Causes:**
- Server is sleeping (Render free tier)
- Wrong URL format
- Network timeout

**Solutions:**
1. Wake up the server:
   ```bash
   curl https://yelpcamp-vvv2.onrender.com/api/stats
   ```
2. Verify URL ends with `/mcp` (no trailing slash):
   ```
   ✅ https://yelpcamp-vvv2.onrender.com/mcp
   ❌ https://yelpcamp-vvv2.onrender.com/mcp/
   ```
3. Wait 30 seconds and retry

### Error 2: "Authentication Failed"

**Possible Causes:**
- Token has typo
- Token has spaces/newlines
- Wrong token format

**Solutions:**
1. Re-copy token (no spaces):
   ```
   9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98
   ```
2. Verify token in Render environment variables
3. Check token format: should be 64 hex characters

### Error 3: "Failed to list tools" (Original Error)

**Cause:** MCP routes didn't support GET method

**Solution:** ✅ FIXED - Updated routes to support both GET and POST

### Error 4: "Tool execution failed"

**Possible Causes:**
- Backend database connection issue
- Tool parameters invalid
- API route error

**Solutions:**
1. Check backend health:
   ```bash
   curl https://yelpcamp-vvv2.onrender.com/api/stats
   ```
2. View Render logs for errors
3. Test tool manually:
   ```bash
   curl -X POST https://yelpcamp-vvv2.onrender.com/mcp/tools/call \
     -H "Authorization: Bearer TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"search_campgrounds","arguments":{"searchTerm":"test"}}'
   ```

### Error 5: "Timeout"

**Possible Causes:**
- Render free tier cold start
- Database query taking too long
- Network issues

**Solutions:**
1. Upgrade to Render paid tier (prevents cold starts)
2. Pre-warm the server before testing
3. Increase timeout in Intercom settings (if available)

---

## Verification Checklist

Before retrying in Intercom:

- [ ] Backend is deployed and running
- [ ] GET method now supported for `/mcp/tools/list`
- [ ] GET method now supported for `/mcp/initialize`
- [ ] Server responds to health check
- [ ] Token is correct in Intercom
- [ ] URL is correct (ends with `/mcp`)
- [ ] No trailing slash in URL

---

## Testing Commands

### Test All Endpoints

```bash
# 1. Health check
curl https://yelpcamp-vvv2.onrender.com/mcp/health

# 2. Initialize (GET)
curl https://yelpcamp-vvv2.onrender.com/mcp/initialize \
  -H "Authorization: Bearer 9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98"

# 3. Tools list (GET)
curl https://yelpcamp-vvv2.onrender.com/mcp/tools/list \
  -H "Authorization: Bearer 9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98"

# 4. Tools list (POST)
curl -X POST https://yelpcamp-vvv2.onrender.com/mcp/tools/list \
  -H "Authorization: Bearer 9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98" \
  -H "Content-Type: application/json"

# 5. Tool execution
curl -X POST https://yelpcamp-vvv2.onrender.com/mcp/tools/call \
  -H "Authorization: Bearer 9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98" \
  -H "Content-Type: application/json" \
  -d '{"name":"search_campgrounds","arguments":{"searchTerm":"beach","limit":2}}'
```

All should return valid JSON responses.

---

## Debug Checklist

If still having issues:

1. **Check Render Logs:**
   - Go to Render dashboard
   - Select your backend service
   - Click "Logs" tab
   - Look for errors during Intercom's connection attempt

2. **Verify Environment Variables:**
   - In Render, check `MCP_ACCESS_TOKEN` is set
   - Should be: `9eaaf63b00a7736c2fea009ab16c7a9b49be928006224caddec07d69fb62bf98`

3. **Test Locally First:**
   - Ensure it works on `localhost:5000`
   - Then test production URL

4. **Check Intercom Requirements:**
   - Verify Intercom supports MCP protocol version 2024-11-05
   - Check if additional headers are required
   - Review Intercom's MCP documentation

---

## What Intercom Should See

After successful connection:

**Server Info:**
```json
{
  "protocolVersion": "2024-11-05",
  "serverInfo": {
    "name": "campgrounds-booking-mcp",
    "version": "1.0.0"
  },
  "capabilities": {
    "tools": {},
    "resources": {}
  }
}
```

**Tools Discovered:** 10
1. get_user_bookings
2. get_booking_details
3. check_campground_availability
4. search_campgrounds
5. get_campground_details
6. cancel_booking
7. get_user_orders
8. get_user_profile
9. get_order_details
10. cancel_order

---

## Next Steps After Fix

1. ✅ Deploy updated code to Render
2. ✅ Test GET endpoints work
3. ✅ Retry Intercom connection
4. ✅ Configure tools in Intercom
5. ✅ Test with Fin AI assistant

---

## Contact Support

If issues persist after these fixes:

**Intercom Support:**
- Check their MCP integration documentation
- Open support ticket with error details
- Share your MCP endpoint URL

**Our Backend:**
- Check Render logs for specific errors
- Verify database connection
- Test individual API routes

---

**Status:** Fix implemented, ready to deploy and retry! 🚀


# Environment Variable Templates

Copy and paste these templates to quickly set up your environment files.

## Main Backend (.env)

**Location**: `yelpcamp-backend/.env`

Add these NEW variables to your existing `.env` file:

```env
# ============================================
# MCP & Intercom Integration (NEW)
# ============================================

# Intercom Configuration
INTERCOM_ACCESS_TOKEN=your_intercom_access_token_here
INTERCOM_MCP_URL=https://api.intercom.io/mcp

# API Access Token (for MCP server to authenticate)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
API_ACCESS_TOKEN=generate_secure_random_token_here

# ============================================
# Keep all your existing variables below
# ============================================
```

## MCP Server (.env)

**Location**: `yelpcamp-backend/mcp-server/.env`

Create this NEW file:

```env
# ============================================
# MCP Server Configuration
# ============================================

# Server Port
MCP_PORT=3001

# Environment
NODE_ENV=development

# Backend API URL
# Development: http://localhost:5000
# Production: https://your-backend.onrender.com
BACKEND_API_URL=http://localhost:5000

# MCP Access Token (Intercom will use this to authenticate)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MCP_ACCESS_TOKEN=generate_secure_random_token_here

# Backend API Token (must match main backend .env)
API_ACCESS_TOKEN=same_token_as_main_backend
```

## Generate Secure Tokens

Run this command twice to generate two different tokens:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**First token** → Use for `MCP_ACCESS_TOKEN` (MCP server only)  
**Second token** → Use for `API_ACCESS_TOKEN` (both backend and MCP server)

Example output:
```
a7f8d9e6c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7
```

## Quick Setup Commands

```bash
# 1. Navigate to backend
cd yelpcamp-backend

# 2. Generate tokens
echo "Token 1 (MCP_ACCESS_TOKEN):"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
echo "\nToken 2 (API_ACCESS_TOKEN):"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Edit main backend .env
nano .env  # or use your preferred editor

# 4. Create MCP server .env
cd mcp-server
touch .env
nano .env  # add configuration

# 5. Install dependencies
npm install
cd ..
npm install

# 6. Start services
cd ..
./start-all-services.sh
```

## Production Environment Variables

For production deployment, update these values:

### Main Backend (Production)
```env
NODE_ENV=production
INTERCOM_ACCESS_TOKEN=your_production_intercom_token
API_ACCESS_TOKEN=different_production_token
```

### MCP Server (Production)
```env
NODE_ENV=production
MCP_PORT=3001
BACKEND_API_URL=https://yelpcamp-vvv2.onrender.com  # Your actual backend URL
MCP_ACCESS_TOKEN=different_production_token
API_ACCESS_TOKEN=same_as_backend_production_token
```

## Verifying Configuration

After setting up, verify everything works:

```bash
# 1. Start backend
cd yelpcamp-backend
npm start

# 2. In another terminal, start MCP server
cd yelpcamp-backend/mcp-server
npm run dev

# 3. In another terminal, test MCP server
curl http://localhost:3001/health

# 4. Test authentication
curl -X POST http://localhost:3001/mcp/tools/list \
  -H "Authorization: Bearer YOUR_MCP_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

Expected success responses:
```json
// Health check
{"status":"healthy","service":"campgrounds-mcp-server"}

// Tools list
{"tools":[{"name":"get_user_bookings",...}]}
```

## Getting Intercom Access Token

1. Log in to Intercom
2. Go to **Settings** → **Developers** → **Developer Hub**
3. Create or select your app
4. Navigate to **Authentication**
5. Copy your **Access Token**
6. Paste it in both `.env` files

## Security Reminders

- ✅ **Never commit** `.env` files to Git
- ✅ **Use different tokens** for development and production
- ✅ **Rotate tokens** every 3-6 months
- ✅ **Keep tokens secret** - they provide full access
- ✅ **Use strong random tokens** - at least 32 characters

## Troubleshooting

### "Error: MCP_ACCESS_TOKEN is required"
→ You forgot to create the `.env` file in `mcp-server/`

### "Error: API_ACCESS_TOKEN is required"
→ You forgot to add `API_ACCESS_TOKEN` to one or both `.env` files

### "Connection refused"
→ Check that `BACKEND_API_URL` points to running backend

### "401 Unauthorized"
→ Verify `API_ACCESS_TOKEN` is identical in both `.env` files

## Complete Checklist

- [ ] Generate two secure random tokens
- [ ] Add new variables to main backend `.env`
- [ ] Create MCP server `.env` file
- [ ] Verify token values match where needed
- [ ] Get Intercom access token from dashboard
- [ ] Add Intercom token to main backend `.env`
- [ ] Test both services start without errors
- [ ] Test MCP health endpoint responds
- [ ] Test MCP tools list with authentication
- [ ] Update production environment variables when deploying

---

**Need help?** Check `MCP_QUICK_START.md` for detailed setup instructions.


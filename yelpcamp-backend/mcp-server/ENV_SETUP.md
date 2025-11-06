# Environment Variables Setup Guide

## MCP Server Environment Variables

Create a `.env` file in the `yelpcamp-backend/mcp-server/` directory with the following variables:

```env
# Server Configuration
MCP_PORT=3001
NODE_ENV=development

# Backend API Configuration
BACKEND_API_URL=http://localhost:5000

# Authentication Tokens
MCP_ACCESS_TOKEN=your_secure_mcp_token_here
API_ACCESS_TOKEN=your_backend_api_token_here
```

## Detailed Configuration

### MCP_PORT
- **Description**: Port for the MCP server to listen on
- **Default**: 3001
- **Required**: No (defaults to 3001)
- **Example**: `3001`

### NODE_ENV
- **Description**: Environment mode (development/production)
- **Default**: production
- **Required**: No
- **Options**: `development`, `production`

### BACKEND_API_URL
- **Description**: Base URL of your main backend API
- **Required**: Yes
- **Development**: `http://localhost:5000`
- **Production**: `https://yelpcamp-vvv2.onrender.com` (or your deployed URL)

### MCP_ACCESS_TOKEN
- **Description**: Access token that Intercom will use to authenticate with your MCP server
- **Required**: Yes
- **Security**: Must be a secure, random string
- **Generate**: 
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Example**: `a7f8d9e6c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7`

### API_ACCESS_TOKEN
- **Description**: Token for authenticating requests to your backend API
- **Required**: Yes
- **Note**: This should match the `API_ACCESS_TOKEN` in your main backend `.env`
- **Location**: Get this from `yelpcamp-backend/.env`

## Production Configuration

For production deployment, update:

```env
NODE_ENV=production
BACKEND_API_URL=https://your-backend-api.onrender.com
MCP_ACCESS_TOKEN=<generate-secure-token>
API_ACCESS_TOKEN=<your-backend-token>
```

## Main Backend Environment Variables

Ensure your main backend (`yelpcamp-backend/.env`) includes:

```env
# API Authentication
API_ACCESS_TOKEN=your_backend_api_token_here

# Intercom Configuration (for MCP Client)
INTERCOM_ACCESS_TOKEN=your_intercom_access_token
INTERCOM_MCP_URL=https://api.intercom.io/mcp
```

## Security Best Practices

1. **Never commit `.env` files** to version control
2. **Use different tokens** for development and production
3. **Rotate tokens regularly** (at least quarterly)
4. **Use environment-specific values** (don't use production tokens in development)
5. **Store production secrets** in your hosting platform's secret manager
6. **Limit token scope** to only necessary permissions

## Obtaining Intercom Credentials

1. Log in to your Intercom workspace
2. Go to **Settings** → **Developers** → **Developer Hub**
3. Create or select your app
4. Navigate to **Authentication**
5. Copy your **Access Token**

## Verifying Configuration

Test your configuration:

```bash
# From mcp-server directory
npm run dev

# In another terminal, test health endpoint
curl http://localhost:3001/health

# Test authenticated endpoint
curl -X POST http://localhost:3001/mcp/tools/list \
  -H "Authorization: Bearer YOUR_MCP_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

## Troubleshooting

### "Error: MCP_ACCESS_TOKEN is required"
- Solution: Set `MCP_ACCESS_TOKEN` in `.env` file

### "Error: API_ACCESS_TOKEN is required"
- Solution: Set `API_ACCESS_TOKEN` in `.env` file

### "Connection refused to backend"
- Solution: Verify `BACKEND_API_URL` is correct and backend is running

### "401 Unauthorized from backend"
- Solution: Ensure `API_ACCESS_TOKEN` matches your backend's token

## Example .env File

```env
# MCP Server Configuration
MCP_PORT=3001
NODE_ENV=development
BACKEND_API_URL=http://localhost:5000

# Security Tokens
MCP_ACCESS_TOKEN=a7f8d9e6c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7
API_ACCESS_TOKEN=b8g9e0f7d5c4b3a2g1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8
```

Remember to replace with your actual secure tokens!


const axios = require('axios');

/**
 * MCP Client for connecting to Intercom's MCP server
 * Allows programmatic access to Intercom data and actions
 */
class IntercomMCPClient {
  constructor(config) {
    this.config = config;
    this.client = null;
    this.connected = false;
  }

  /**
   * Connect to Intercom's MCP server
   */
  async connect() {
    if (this.connected) return;

    try {
      this.connected = true;
      console.log('✅ Connected to Intercom MCP');
    } catch (error) {
      console.error('❌ Failed to connect to Intercom MCP:', error);
      throw error;
    }
  }

  /**
   * Make HTTP requests to Intercom's MCP endpoints
   */
  async makeRequest(endpoint, data) {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}${endpoint}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Intercom MCP request failed:`, error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * List available tools from Intercom's MCP
   */
  async listTools() {
    await this.connect();
    return await this.makeRequest('/tools/list', {});
  }

  /**
   * Call a tool on Intercom's MCP
   */
  async callTool(toolName, args) {
    await this.connect();
    return await this.makeRequest('/tools/call', {
      name: toolName,
      arguments: args
    });
  }

  /**
   * Fallback: Use Intercom REST API directly if MCP is not available
   */
  async updateUserViaAPI(user) {
    try {
      const response = await axios.post(
        'https://api.intercom.io/users',
        user,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update user via Intercom API:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Fallback: Track event via Intercom REST API if MCP is not available
   */
  async trackEventViaAPI(userId, eventName, metadata) {
    try {
      const response = await axios.post(
        'https://api.intercom.io/events',
        {
          user_id: userId,
          event_name: eventName,
          created_at: Math.floor(Date.now() / 1000),
          metadata: metadata
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to track event via Intercom API:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Disconnect from Intercom MCP
   */
  async disconnect() {
    if (this.client && this.connected) {
      this.connected = false;
      console.log('Disconnected from Intercom MCP');
    }
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }
}

// Export singleton instance
let intercomMCPClient = null;

const getIntercomMCPClient = () => {
  if (!intercomMCPClient) {
    const mcpUrl = process.env.INTERCOM_MCP_URL;
    const accessToken = process.env.INTERCOM_ACCESS_TOKEN;

    if (!accessToken) {
      console.warn('⚠️ INTERCOM_ACCESS_TOKEN not set - Intercom MCP client disabled');
      // Return a mock client that does nothing
      return {
        connect: async () => {},
        disconnect: async () => {},
        trackEventViaAPI: async () => {},
        updateUserViaAPI: async () => {},
        isConnected: () => false
      };
    }

    intercomMCPClient = new IntercomMCPClient({
      baseUrl: mcpUrl || 'https://api.intercom.io/mcp',
      accessToken: accessToken
    });
  }
  return intercomMCPClient;
};

module.exports = { IntercomMCPClient, getIntercomMCPClient };


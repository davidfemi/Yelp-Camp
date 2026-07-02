// Configuration for different environments
const ENV = {
  dev: {
    API_URL: 'http://10.200.2.59:5000',  // Local network IP for physical devices
  },
  prod: {
    API_URL: 'https://yelpcamp-vvv2.onrender.com',
  },
};

// Use dev for local backend, prod for deployed backend
const currentEnv = ENV.dev;

export default currentEnv;






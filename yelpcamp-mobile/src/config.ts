// Configuration for different environments
const ENV = {
  dev: {
    API_URL: 'http://10.0.2.2:5000',  // Android emulator local address
  },
  prod: {
    API_URL: 'https://yelpcamp-vvv2.onrender.com',
  },
};

// Use dev for now (can switch based on __DEV__ in future)
const currentEnv = ENV.dev;

export default currentEnv;



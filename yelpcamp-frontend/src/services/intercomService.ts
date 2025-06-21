// Track if Intercom has been booted
let isBooted = false;

// Get Intercom app ID from environment variables
const INTERCOM_APP_ID = process.env.REACT_APP_INTERCOM_APP_ID || 'hqd6b4qh';

// Update Intercom with user data
export const updateIntercomUser = (user: any) => {
  if (!user) {
    // If no user, shutdown Intercom session and reset boot state
    window.Intercom && window.Intercom('shutdown');
    // Boot Intercom for logged-out state
    window.Intercom && window.Intercom('boot', {
      app_id: INTERCOM_APP_ID
    });
    isBooted = false;
    return;
  }

  const userData = {
    app_id: INTERCOM_APP_ID,
    name: user.username || user.name,
    email: user.email,
    user_id: user.id || user.user_id || user.email, // Use provided user_id if available, otherwise fall back to email
    created_at: Math.floor(Date.now() / 1000), // Current timestamp in seconds
    role: user.role,
    website: user.website || 'reacttest-kappa-two.vercel.app',
    // Include additional user properties if they exist
    ...(user.number_of_dogs && { number_of_dogs: user.number_of_dogs }),
    ...(user.dash && { dash: user.dash })
  };

  if (!isBooted) {
    // First time - boot with user data
    window.Intercom && window.Intercom('boot', userData);
    isBooted = true;
  } else {
    // Subsequent updates - use update
    window.Intercom && window.Intercom('update', userData);
  }
};

// Update Intercom when URL changes
export const updateIntercomPage = () => {
  if (window.Intercom) {
    window.Intercom('update', {
      last_request_at: Math.floor(Date.now() / 1000)
    });
  }
};

// Manual show function
export const showIntercom = () => {
  if (window.Intercom) {
    window.Intercom('show');
  }
};

// Manual hide function
export const hideIntercom = () => {
  if (window.Intercom) {
    window.Intercom('hide');
  }
};

// Shutdown Intercom (useful for logout)
export const shutdownIntercom = () => {
  if (window.Intercom) {
    window.Intercom('shutdown');
    isBooted = false;
  }
}; 
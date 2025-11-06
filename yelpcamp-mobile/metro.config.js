const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Disable Watchman due to permission issues with paths containing spaces
if (config.watchman) {
  config.watchman.enabled = false;
}

module.exports = config;
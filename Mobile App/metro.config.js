const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add PNG (uppercase) extension to assetExts
config.resolver.assetExts.push('PNG');

module.exports = withNativeWind(config, { input: './global.css' });

const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// Ensure wasm is treated as an asset so imports like './wa-sqlite.wasm' resolve
const assetExts = defaultConfig.resolver.assetExts || [];
if (!assetExts.includes('wasm')) {
    assetExts.push('wasm');
}

module.exports = {
    ...defaultConfig,
    resolver: {
        ...defaultConfig.resolver,
        assetExts,
    },
};

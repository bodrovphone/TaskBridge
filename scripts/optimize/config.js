const fs = require('fs');
const path = require('path');

/**
 * Default configuration for media optimization
 */
const defaultConfig = {
  images: {
    quality: 85,
    formats: ['webp', 'avif'],
    sizes: [320, 640, 1024, 1920],
    outputDir: 'public/optimized/images',
    preserveOriginal: true,
    removeMetadata: true,
  },
  videos: {
    formats: ['mp4', 'webm'],
    maxResolution: 1920,
    bitrate: '1M',
    outputDir: 'public/optimized/videos',
    generateThumbnails: true,
  },
};

/**
 * Load configuration from .mediarc file or use defaults
 * @param {string} configPath - Path to custom config file
 * @returns {Object} Merged configuration object
 */
function loadConfig(configPath = null) {
  let userConfig = {};

  // Try to load custom config if provided
  if (configPath && fs.existsSync(configPath)) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf8');
      userConfig = JSON.parse(configContent);
    } catch (error) {
      console.warn(`Warning: Failed to parse config file at ${configPath}:`, error.message);
    }
  } else {
    // Try to load .mediarc from project root
    const defaultConfigPath = path.join(process.cwd(), '.mediarc');
    if (fs.existsSync(defaultConfigPath)) {
      try {
        const configContent = fs.readFileSync(defaultConfigPath, 'utf8');
        userConfig = JSON.parse(configContent);
      } catch (error) {
        console.warn('Warning: Failed to parse .mediarc file:', error.message);
      }
    }
  }

  // Deep merge user config with defaults
  return {
    images: {
      ...defaultConfig.images,
      ...(userConfig.images || {}),
    },
    videos: {
      ...defaultConfig.videos,
      ...(userConfig.videos || {}),
    },
  };
}

/**
 * Validate configuration values
 * @param {Object} config - Configuration object to validate
 * @returns {Object} Validated configuration
 */
function validateConfig(config) {
  // Validate image quality
  if (config.images.quality < 1 || config.images.quality > 100) {
    console.warn('Warning: Image quality must be between 1-100. Using default: 85');
    config.images.quality = 85;
  }

  // Validate image formats
  const validImageFormats = ['webp', 'avif', 'jpeg', 'png'];
  config.images.formats = config.images.formats.filter(format => {
    const isValid = validImageFormats.includes(format);
    if (!isValid) {
      console.warn(`Warning: Invalid image format "${format}". Skipping.`);
    }
    return isValid;
  });

  // Validate video formats
  const validVideoFormats = ['mp4', 'webm'];
  config.videos.formats = config.videos.formats.filter(format => {
    const isValid = validVideoFormats.includes(format);
    if (!isValid) {
      console.warn(`Warning: Invalid video format "${format}". Skipping.`);
    }
    return isValid;
  });

  // Validate image sizes
  config.images.sizes = config.images.sizes.filter(size => {
    const isValid = typeof size === 'number' && size > 0;
    if (!isValid) {
      console.warn(`Warning: Invalid image size "${size}". Skipping.`);
    }
    return isValid;
  });

  return config;
}

module.exports = {
  defaultConfig,
  loadConfig,
  validateConfig,
};

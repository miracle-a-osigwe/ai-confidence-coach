const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for native modules
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for OpenCV and MediaPipe assets
config.resolver.assetExts.push(
  // OpenCV models and configs
  'xml',
  'yml',
  'yaml',
  'caffemodel',
  'prototxt',
  'onnx',
  'tflite',
  // MediaPipe models
  'binarypb',
  'pbtxt'
);

module.exports = config;
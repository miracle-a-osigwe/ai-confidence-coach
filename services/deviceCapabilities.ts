import { Platform } from 'react-native';
import * as Device from 'expo-device';

interface DeviceCapabilities {
  tier: 'high' | 'mid' | 'low';
  maxFrameRate: number;
  enabledFeatures: string[];
  useGPU: boolean;
  batteryOptimized: boolean;
}

class DeviceCapabilitiesService {
  private capabilities: DeviceCapabilities | null = null;

  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const deviceInfo = {
      platform: Platform.OS,
      model: Device.modelName || 'Unknown',
      year: Device.deviceYearClass || 2020,
      memory: Device.totalMemory || 4000000000, // 4GB default
    };

    this.capabilities = this.calculateCapabilities(deviceInfo);
    return this.capabilities;
  }

  private calculateCapabilities(deviceInfo: any): DeviceCapabilities {
    const { platform, year, memory } = deviceInfo;

    // High-end devices (2021+, 6GB+ RAM)
    if (year >= 2021 && memory >= 6000000000) {
      return {
        tier: 'high',
        maxFrameRate: 30,
        enabledFeatures: [
          'faceDetection',
          'poseEstimation', 
          'handTracking',
          'emotionAnalysis',
          'voiceAnalysis',
          'gestureRecognition'
        ],
        useGPU: true,
        batteryOptimized: false,
      };
    }

    // Mid-range devices (2019+, 4GB+ RAM)
    if (year >= 2019 && memory >= 4000000000) {
      return {
        tier: 'mid',
        maxFrameRate: 20,
        enabledFeatures: [
          'faceDetection',
          'poseEstimation',
          'emotionAnalysis',
          'voiceAnalysis'
        ],
        useGPU: platform === 'ios', // iOS GPU support is more reliable
        batteryOptimized: true,
      };
    }

    // Low-end devices (older or budget)
    return {
      tier: 'low',
      maxFrameRate: 15,
      enabledFeatures: [
        'faceDetection',
        'emotionAnalysis',
        'voiceAnalysis'
      ],
      useGPU: false,
      batteryOptimized: true,
    };
  }

  async getOptimalSettings(): Promise<{
    frameRate: number;
    resolution: { width: number; height: number };
    enabledFeatures: string[];
    processingMode: 'gpu' | 'cpu' | 'hybrid';
  }> {
    const capabilities = await this.detectCapabilities();

    const resolutionMap = {
      high: { width: 1280, height: 720 },
      mid: { width: 960, height: 540 },
      low: { width: 640, height: 480 },
    };

    return {
      frameRate: capabilities.maxFrameRate,
      resolution: resolutionMap[capabilities.tier],
      enabledFeatures: capabilities.enabledFeatures,
      processingMode: capabilities.useGPU ? 'gpu' : 'cpu',
    };
  }

  // Battery optimization strategies
  getBatteryOptimizations(): {
    reducedFrameRate: number;
    skipFrames: number;
    pauseOnBackground: boolean;
    thermalThrottling: boolean;
  } {
    return {
      reducedFrameRate: 10, // Drop to 10 FPS when battery low
      skipFrames: 2, // Process every 3rd frame when optimizing
      pauseOnBackground: true, // Stop processing when app backgrounded
      thermalThrottling: true, // Reduce processing when device heats up
    };
  }
}

export const deviceCapabilitiesService = new DeviceCapabilitiesService();
export default deviceCapabilitiesService;
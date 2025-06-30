# Native Development Setup for Computer Vision

This guide will help you set up the native development environment for full OpenCV and MediaPipe integration.

## Prerequisites

- **macOS** (for iOS development)
- **Xcode 15+** with Command Line Tools
- **Android Studio** with Android SDK
- **Node.js 18+**
- **Expo CLI**: `npm install -g @expo/cli`
- **EAS CLI**: `npm install -g eas-cli`

## Step 1: Export from Bolt

If you're coming from Bolt, export your project:

```bash
# Download the project files from Bolt
# Extract to your local development directory
cd confidence-coach-mobile
npm install
```

## Step 2: Install Development Dependencies

```bash
# Install Expo Dev Client
npx expo install expo-dev-client

# Install native vision dependencies
npm install react-native-opencv react-native-mediapipe

# For iOS, install CocoaPods dependencies
cd ios && pod install && cd ..
```

## Step 3: Configure EAS

```bash
# Login to Expo
eas login

# Configure your project
eas build:configure

# Update your project ID in app.json
```

## Step 4: Create Development Build

### For iOS:

```bash
# Create development build
eas build --platform ios --profile development

# Install on device/simulator
eas build:run --platform ios --latest
```

### For Android:

```bash
# Create development build
eas build --platform android --profile development

# Install on device/emulator
eas build:run --platform android --latest
```

## Step 5: Native Module Implementation

### iOS Implementation

Create the following files in your iOS project:

#### `ios/ConfidenceCoach/OpenCVModule.h`
```objc
#import <React/RCTBridgeModule.h>
#import <opencv2/opencv.hpp>

@interface OpenCVModule : NSObject <RCTBridgeModule>
@end
```

#### `ios/ConfidenceCoach/OpenCVModule.mm`
```objc
#import "OpenCVModule.h"
#import <React/RCTLog.h>

@implementation OpenCVModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(initializeOpenCV:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Initialize OpenCV
        cv::Mat testMat = cv::Mat::zeros(100, 100, CV_8UC3);
        resolve(@YES);
    } @catch (NSException *exception) {
        reject(@"opencv_init_error", @"Failed to initialize OpenCV", nil);
    }
}

RCT_EXPORT_METHOD(detectFaceLandmarks:(NSString *)imageData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Implement face landmark detection using OpenCV
        // This is a simplified example - implement actual detection
        NSMutableArray *landmarks = [[NSMutableArray alloc] init];
        
        // Add 68 landmark points (simplified)
        for (int i = 0; i < 68; i++) {
            NSArray *point = @[@(arc4random_uniform(640)), @(arc4random_uniform(480))];
            [landmarks addObject:point];
        }
        
        resolve(landmarks);
    } @catch (NSException *exception) {
        reject(@"face_detection_error", @"Failed to detect face landmarks", nil);
    }
}

// Implement other OpenCV methods...

@end
```

#### `ios/ConfidenceCoach/MediaPipeModule.h`
```objc
#import <React/RCTBridgeModule.h>
#import <MediaPipeTasksVision/MediaPipeTasksVision.h>

@interface MediaPipeModule : NSObject <RCTBridgeModule>
@end
```

#### `ios/ConfidenceCoach/MediaPipeModule.mm`
```objc
#import "MediaPipeModule.h"
#import <React/RCTLog.h>

@implementation MediaPipeModule

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(initializeMediaPipe:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Initialize MediaPipe
        resolve(@YES);
    } @catch (NSException *exception) {
        reject(@"mediapipe_init_error", @"Failed to initialize MediaPipe", nil);
    }
}

RCT_EXPORT_METHOD(estimatePose:(NSString *)imageData
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
    @try {
        // Implement pose estimation using MediaPipe
        NSMutableArray *keypoints = [[NSMutableArray alloc] init];
        
        NSArray *keypointNames = @[@"nose", @"left_eye", @"right_eye", @"left_ear", @"right_ear",
                                  @"left_shoulder", @"right_shoulder", @"left_elbow", @"right_elbow",
                                  @"left_wrist", @"right_wrist", @"left_hip", @"right_hip",
                                  @"left_knee", @"right_knee", @"left_ankle", @"right_ankle"];
        
        for (NSString *name in keypointNames) {
            NSDictionary *keypoint = @{
                @"x": @(arc4random_uniform(640)),
                @"y": @(arc4random_uniform(480)),
                @"confidence": @(0.7 + (arc4random_uniform(30) / 100.0)),
                @"name": name
            };
            [keypoints addObject:keypoint];
        }
        
        resolve(keypoints);
    } @catch (NSException *exception) {
        reject(@"pose_estimation_error", @"Failed to estimate pose", nil);
    }
}

// Implement other MediaPipe methods...

@end
```

### Android Implementation

Create the following files in your Android project:

#### `android/app/src/main/java/com/confidencecoach/app/OpenCVModule.java`
```java
package com.confidencecoach.app;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import org.opencv.android.OpenCVLoaderCallback;
import org.opencv.android.OpenCVLoader;
import org.opencv.core.Mat;

public class OpenCVModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "OpenCVModule";
    private boolean isOpenCVInitialized = false;

    public OpenCVModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void initializeOpenCV(Promise promise) {
        try {
            if (!OpenCVLoader.initDebug()) {
                promise.reject("opencv_init_error", "Failed to initialize OpenCV");
                return;
            }
            isOpenCVInitialized = true;
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("opencv_init_error", "Failed to initialize OpenCV", e);
        }
    }

    @ReactMethod
    public void detectFaceLandmarks(String imageData, Promise promise) {
        try {
            if (!isOpenCVInitialized) {
                promise.reject("opencv_not_initialized", "OpenCV not initialized");
                return;
            }

            // Implement face landmark detection
            WritableArray landmarks = new WritableNativeArray();
            
            // Add 68 landmark points (simplified)
            for (int i = 0; i < 68; i++) {
                WritableArray point = new WritableNativeArray();
                point.pushDouble(Math.random() * 640);
                point.pushDouble(Math.random() * 480);
                landmarks.pushArray(point);
            }
            
            promise.resolve(landmarks);
        } catch (Exception e) {
            promise.reject("face_detection_error", "Failed to detect face landmarks", e);
        }
    }

    // Implement other OpenCV methods...
}
```

#### `android/app/src/main/java/com/confidencecoach/app/MediaPipeModule.java`
```java
package com.confidencecoach.app;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;

import com.google.mediapipe.tasks.vision.poselandmarker.PoseLandmarker;

public class MediaPipeModule extends ReactContextBaseJavaModule {
    private static final String MODULE_NAME = "MediaPipeModule";
    private boolean isMediaPipeInitialized = false;

    public MediaPipeModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void initializeMediaPipe(Promise promise) {
        try {
            // Initialize MediaPipe
            isMediaPipeInitialized = true;
            promise.resolve(true);
        } catch (Exception e) {
            promise.reject("mediapipe_init_error", "Failed to initialize MediaPipe", e);
        }
    }

    @ReactMethod
    public void estimatePose(String imageData, Promise promise) {
        try {
            if (!isMediaPipeInitialized) {
                promise.reject("mediapipe_not_initialized", "MediaPipe not initialized");
                return;
            }

            // Implement pose estimation
            WritableArray keypoints = new WritableNativeArray();
            
            String[] keypointNames = {"nose", "left_eye", "right_eye", "left_ear", "right_ear",
                                    "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
                                    "left_wrist", "right_wrist", "left_hip", "right_hip",
                                    "left_knee", "right_knee", "left_ankle", "right_ankle"};
            
            for (String name : keypointNames) {
                WritableMap keypoint = new WritableNativeMap();
                keypoint.putDouble("x", Math.random() * 640);
                keypoint.putDouble("y", Math.random() * 480);
                keypoint.putDouble("confidence", 0.7 + Math.random() * 0.3);
                keypoint.putString("name", name);
                keypoints.pushMap(keypoint);
            }
            
            promise.resolve(keypoints);
        } catch (Exception e) {
            promise.reject("pose_estimation_error", "Failed to estimate pose", e);
        }
    }

    // Implement other MediaPipe methods...
}
```

## Step 6: Register Native Modules

### iOS Registration

Add to `ios/ConfidenceCoach/AppDelegate.mm`:

```objc
#import "OpenCVModule.h"
#import "MediaPipeModule.h"

// In the application:didFinishLaunchingWithOptions method
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // ... existing code ...
    
    // Initialize OpenCV on app start
    if (!cv::getBuildInformation().empty()) {
        NSLog(@"OpenCV initialized successfully");
    }
    
    return YES;
}
```

### Android Registration

Add to `android/app/src/main/java/com/confidencecoach/app/MainApplication.java`:

```java
import com.confidencecoach.app.OpenCVModule;
import com.confidencecoach.app.MediaPipeModule;

@Override
protected List<ReactPackage> getPackages() {
    @SuppressWarnings("UnnecessaryLocalVariable")
    List<ReactPackage> packages = new PackageList(this).getPackages();
    
    // Add native modules
    packages.add(new ReactPackage() {
        @Override
        public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
            List<NativeModule> modules = new ArrayList<>();
            modules.add(new OpenCVModule(reactContext));
            modules.add(new MediaPipeModule(reactContext));
            return modules;
        }

        @Override
        public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
            return Collections.emptyList();
        }
    });
    
    return packages;
}
```

## Step 7: Update Vision Service

Update `services/visionAnalysis.ts` to use native modules when available:

```typescript
import nativeVisionService from './nativeVision';

class VisionAnalysisService {
  async initialize(): Promise<boolean> {
    // Try native first, fallback to web
    if (nativeVisionService.isNativeVisionAvailable()) {
      return await nativeVisionService.initialize();
    } else {
      return this.initializeWebVision();
    }
  }

  // ... rest of implementation
}
```

## Step 8: Testing

### Development Testing

```bash
# Start the development server
npm run dev

# The app will open in Expo Go or your development build
# Test camera permissions and vision analysis features
```

### Production Testing

```bash
# Build preview version
npm run build:preview

# Test on physical devices
eas build:run --platform ios --latest
eas build:run --platform android --latest
```

## Troubleshooting

### Common Issues

1. **OpenCV not found**: Ensure OpenCV is properly installed via CocoaPods/Gradle
2. **MediaPipe models missing**: Download required models to assets folder
3. **Camera permissions**: Check Info.plist and AndroidManifest.xml permissions
4. **Build errors**: Clean build folders and reinstall dependencies

### Performance Optimization

1. **Frame rate**: Adjust analysis frequency based on device capabilities
2. **Model size**: Use optimized models for mobile devices
3. **Memory management**: Properly dispose of OpenCV Mat objects
4. **Threading**: Run analysis on background threads

## Next Steps

1. Implement actual computer vision algorithms
2. Add model files for MediaPipe
3. Optimize for real-time performance
4. Add error handling and fallbacks
5. Test on various devices and lighting conditions

For more detailed implementation examples, see the native module documentation and OpenCV/MediaPipe tutorials.
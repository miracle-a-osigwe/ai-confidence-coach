# Confidence Coach Mobile App

A React Native application built with Expo that provides AI-powered public speaking coaching with real-time feedback. The app helps users improve their confidence, clarity, and overall presentation skills through practice sessions with live emotion detection, speech analysis, and personalized coaching insights.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Vision Analysis Integration](#vision-analysis-integration)
- [Native Development Setup](#native-development-setup)
- [Backend Integration](#backend-integration)
- [Development Setup](#development-setup)
- [Environment Configuration](#environment-configuration)
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [Data Models](#data-models)
- [Deployment](#deployment)

## Overview

The Confidence Coach mobile app is designed to help users improve their public speaking skills through:

- **Real-time AI Analysis**: Live emotion detection and speech analysis during practice sessions
- **Computer Vision Integration**: OpenCV and MediaPipe for face, posture, and gesture analysis
- **Personalized Coaching**: AI-powered insights and recommendations based on user performance
- **Progress Tracking**: Comprehensive analytics and reporting on improvement over time
- **Interactive Sessions**: Live feedback with coaching cues and transcription

## Technology Stack

### Frontend
- **Framework**: React Native with Expo SDK 52.0.30
- **Navigation**: Expo Router 4.0.17 with tab-based navigation
- **State Management**: React hooks with custom service layers
- **Storage**: AsyncStorage for local data persistence
- **Real-time Communication**: Socket.IO for WebSocket connections
- **Charts**: react-native-chart-kit for analytics visualization
- **Icons**: Lucide React Native for consistent iconography

### Computer Vision
- **MediaPipe**: Face mesh, pose estimation, and hand tracking
- **OpenCV**: Image processing and computer vision algorithms
- **Web Support**: MediaPipe web solutions for browser compatibility
- **Native Support**: OpenCV4Android and OpenCV for iOS

### Backend Requirements
- **API**: RESTful API with JWT authentication
- **WebSocket**: Socket.IO server for real-time communication
- **AI Services**: Speech-to-text, emotion detection, and coaching AI
- **Database**: User profiles, sessions, and analytics storage
- **File Storage**: Audio/video processing and storage

## Vision Analysis Integration

### Computer Vision Features

The app integrates OpenCV and MediaPipe for comprehensive real-time analysis:

#### Face Analysis
- **68-point facial landmarks** for precise face tracking
- **Emotion detection** (confidence, joy, surprise, anger, sadness, fear, disgust)
- **Eye contact tracking** with gaze direction analysis
- **Head pose estimation** (pitch, yaw, roll)
- **Face quality assessment** (brightness, sharpness, visibility)

#### Posture Analysis
- **17-point pose estimation** for full body tracking
- **Shoulder and spine alignment** scoring
- **Head position** relative to body
- **Movement stability** and fidgeting detection
- **Overall posture scoring** (0-100)

#### Gesture Analysis
- **21-point hand landmarks** for both hands
- **Gesture recognition** (open hands, pointing, fidgeting)
- **Gesture variety** and appropriateness scoring
- **Arm movement** frequency and naturalness
- **Fidgeting detection** and scoring

#### Voice Analysis Integration
- **Volume and pitch** analysis
- **Speech pace** (words per minute)
- **Clarity scoring** based on articulation
- **Filler word detection** ("um", "uh", "like")
- **Pause analysis** for natural speech flow

### Platform-Specific Implementation

#### Web Platform (MediaPipe Web)
```typescript
// Uses MediaPipe JavaScript solutions
import { FaceMesh } from '@mediapipe/face_mesh';
import { Holistic } from '@mediapipe/holistic';
import { Hands } from '@mediapipe/hands';

// Real-time processing at 15 FPS for web compatibility
const processFrame = async (videoElement) => {
  const results = await holisticModel.send({ image: videoElement });
  return analyzeResults(results);
};
```

#### Native Platform (OpenCV + MediaPipe)
```typescript
// Uses native OpenCV and MediaPipe modules
// Requires expo-dev-client for native code integration

// Face detection and landmark extraction at 30 FPS
const faceResults = await OpenCV.detectFaceLandmarks(imageData);

// Pose estimation
const poseResults = await MediaPipe.estimatePose(imageData);

// Hand tracking
const handResults = await MediaPipe.trackHands(imageData);
```

### Confidence Scoring Algorithm

The app uses a sophisticated scoring system that combines multiple metrics:

```typescript
interface ConfidenceMetrics {
  overall: number; // Weighted average of all factors
  breakdown: {
    facial: number;    // Eye contact + facial expressions
    vocal: number;     // Clarity + pace + volume
    postural: number;  // Posture + stability
    gestural: number;  // Gesture variety + appropriateness
  };
  focusAreas: {
    [key: string]: number; // User-selected focus areas
  };
  realTimeScore: number;   // Live updating score
  trend: 'improving' | 'declining' | 'stable';
}
```

### Focus Area Customization

Based on user onboarding selections, the system emphasizes different aspects:

- **Confidence**: Facial expressions, eye contact, voice conviction
- **Clarity**: Speech pace, articulation, filler words
- **Body Language**: Posture, gestures, movement stability
- **Engagement**: Eye contact, facial expressions, gesture variety

## Native Development Setup

### Quick Start for Full Computer Vision

For the complete computer vision experience with OpenCV and MediaPipe:

1. **Export from Bolt** (if applicable):
```bash
# Download project files and extract locally
cd confidence-coach-mobile
npm install
```

2. **Install Development Build Tools**:
```bash
# Install EAS CLI
npm install -g eas-cli

# Install Expo Dev Client
npx expo install expo-dev-client

# Configure EAS
eas build:configure
```

3. **Create Development Build**:
```bash
# For iOS
eas build --platform ios --profile development

# For Android
eas build --platform android --profile development
```

4. **Install and Run**:
```bash
# Install on device
eas build:run --platform ios --latest
eas build:run --platform android --latest

# Start development server
npm run dev
```

### Native Module Implementation

The app includes native modules for:

- **OpenCVModule**: Face detection, landmark extraction, emotion analysis
- **MediaPipeModule**: Pose estimation, hand tracking, gesture analysis
- **AudioAnalysisModule**: Voice analysis, speech-to-text, filler word detection

See `docs/NATIVE_SETUP.md` for detailed implementation instructions.

### Platform Capabilities

| Feature | Web | Native iOS | Native Android |
|---------|-----|------------|----------------|
| Face Detection | ✅ (15 FPS) | ✅ (30 FPS) | ✅ (30 FPS) |
| Pose Estimation | ✅ (15 FPS) | ✅ (30 FPS) | ✅ (30 FPS) |
| Hand Tracking | ✅ (15 FPS) | ✅ (30 FPS) | ✅ (30 FPS) |
| Voice Analysis | ✅ | ✅ | ✅ |
| Real-time Processing | ✅ | ✅ | ✅ |
| GPU Acceleration | ❌ | ✅ | ✅ |

## Project Structure

```
app/
├── _layout.tsx                 # Root layout with Stack navigator
├── +not-found.tsx             # 404 error page
├── (auth)/                    # Authentication flow
│   ├── _layout.tsx           # Auth stack layout
│   ├── welcome.tsx           # Landing/welcome screen
│   ├── login.tsx             # User login
│   ├── signup.tsx            # User registration
│   ├── forgot-password.tsx   # Password reset
│   └── onboarding.tsx        # User onboarding flow
└── (tabs)/                   # Main app with tab navigation
    ├── _layout.tsx           # Tab layout configuration
    ├── index.tsx             # Home/dashboard screen
    ├── session.tsx           # Practice session screen
    ├── reports.tsx           # Analytics and reports
    └── profile.tsx           # User profile and settings

components/
├── AICoach.tsx               # AI coach avatar component
├── CameraView.tsx            # Camera preview component
├── EmotionChart.tsx          # Real-time emotion visualization
├── TranscriptionPanel.tsx    # Live speech transcription
├── VisionAnalysisOverlay.tsx # Real-time vision analysis display
└── reports/                  # Analytics components
    ├── EmotionRadarChart.tsx
    ├── ProgressChart.tsx
    └── SessionMetricsChart.tsx

services/
├── api.ts                    # RESTful API service
├── websocket.ts              # WebSocket service for real-time data
├── storage.ts                # Local storage management
├── visionAnalysis.ts         # Main vision analysis service
└── nativeVision.ts           # Native OpenCV/MediaPipe integration

hooks/
├── useAuth.ts                # Authentication state management
├── useSession.ts             # Practice session management
├── useVisionAnalysis.ts      # Computer vision analysis hook
└── useFrameworkReady.ts      # Framework initialization

constants/
└── Colors.ts                 # Theme and color definitions

docs/
└── NATIVE_SETUP.md           # Detailed native development guide

ios/                          # iOS native code (after prebuild)
├── Podfile                   # CocoaPods dependencies
└── ConfidenceCoach/          # Native modules
    ├── OpenCVModule.h/.mm
    ├── MediaPipeModule.h/.mm
    └── AudioAnalysisModule.h/.mm

android/                      # Android native code (after prebuild)
├── app/build.gradle          # Gradle dependencies
└── app/src/main/java/        # Native modules
    ├── OpenCVModule.java
    ├── MediaPipeModule.java
    └── AudioAnalysisModule.java
```

## Features

### Authentication Flow
- **Welcome Screen**: App introduction with feature highlights
- **Login/Signup**: Email/password authentication with validation
- **Onboarding**: Multi-step user preference collection including:
  - Speaking goals (presentations, interviews, public speaking)
  - Experience level assessment
  - Focus areas (confidence, clarity, engagement, body language)
- **Password Reset**: Email-based password recovery

### Main Application
- **Dashboard**: User stats, recent sessions, quick session start
- **Practice Sessions**: Real-time coaching with:
  - Live video preview with camera controls
  - Computer vision analysis overlay
  - Emotion analysis visualization
  - AI coach avatar with dynamic feedback
  - Speech transcription with filler word detection
  - Session timer and controls
  - Real-time confidence scoring
- **Reports & Analytics**: Progress tracking with charts and insights
- **Profile Management**: User settings and preferences

### Real-time Vision Analysis
- **Live Confidence Scoring**: Updates every 33ms (30 FPS) on native, 67ms (15 FPS) on web
- **Focus Area Tracking**: Personalized based on user preferences
- **Coaching Recommendations**: AI-generated tips based on analysis
- **Trend Analysis**: Real-time improvement/decline detection
- **Multi-metric Display**: Face, voice, posture, and gesture scores

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Expo CLI: `npm install -g @expo/cli`
- EAS CLI: `npm install -g eas-cli` (for native builds)
- iOS Simulator (macOS) or Android Emulator

### Quick Start (Web Development)

```bash
# Clone and install dependencies
git clone <repository-url>
cd confidence-coach-mobile
npm install

# Start web development
npm run dev:web
```

### Native Development

```bash
# Install dependencies
npm install

# Create development build
eas build --platform ios --profile development
eas build --platform android --profile development

# Start development server
npm run dev

# Install and run on device
eas build:run --platform ios --latest
eas build:run --platform android --latest
```

### Available Scripts

```bash
npm run dev          # Start with dev client
npm run dev:web      # Start web development
npm run build:ios    # Build iOS development
npm run build:android # Build Android development
npm run build:preview # Build preview version
npm run build:production # Build production version
npm run prebuild     # Generate native code
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
```

## Environment Configuration

Create a `.env` file in the project root:

```env
# API Configuration
EXPO_PUBLIC_API_URL=https://api.confidencecoach.app
EXPO_PUBLIC_WS_URL=wss://ws.confidencecoach.app

# Authentication
EXPO_PUBLIC_AUTH_DOMAIN=confidencecoach.app

# Vision Analysis
EXPO_PUBLIC_VISION_API_URL=https://vision.confidencecoach.app
EXPO_PUBLIC_MEDIAPIPE_MODEL_URL=https://models.confidencecoach.app

# Analytics (optional)
EXPO_PUBLIC_ANALYTICS_ID=your_analytics_id

# Development settings
EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_VISION_DEBUG=false
```

## Backend Integration

The mobile app integrates with backend services through multiple channels:

### 1. RESTful API (`services/api.ts`)
Standard CRUD operations and authentication

### 2. WebSocket Service (`services/websocket.ts`)
Real-time communication during sessions

### 3. Vision Analysis Data Flow
```typescript
// Real-time vision data sent to backend
interface VisionDataPacket {
  timestamp: number;
  sessionId: string;
  faceAnalysis: FaceAnalysis;
  postureAnalysis: PostureAnalysis;
  gestureAnalysis: GestureAnalysis;
  voiceAnalysis: VoiceAnalysis;
  confidenceMetrics: ConfidenceMetrics;
}
```

## Data Models

### Vision Analysis Models

```typescript
interface VisionAnalysisResult {
  timestamp: number;
  face: FaceAnalysis;
  posture: PostureAnalysis;
  gestures: GestureAnalysis;
  voice: VoiceAnalysis;
  confidence: ConfidenceMetrics;
  recommendations: string[];
}

interface FaceAnalysis {
  landmarks: number[][];
  emotions: {
    confidence: number;
    joy: number;
    surprise: number;
    anger: number;
    sadness: number;
    fear: number;
    disgust: number;
  };
  eyeContact: {
    leftEye: { x: number; y: number; isOpen: boolean };
    rightEye: { x: number; y: number; isOpen: boolean };
    gazeDirection: { x: number; y: number };
    eyeContactScore: number;
  };
  headPose: {
    pitch: number;
    yaw: number;
    roll: number;
  };
}
```

## Backend Implementation Requirements

### Core Services Needed

1. **Vision Analysis Service**
   - Real-time video/audio stream processing
   - OpenCV and MediaPipe integration
   - Confidence scoring algorithms
   - Coaching recommendation engine

2. **AI Analysis Service**
   - Speech-to-text processing
   - Emotion detection from audio/video
   - Coaching insight generation
   - Performance metrics calculation

3. **Session Management Service**
   - Session lifecycle management
   - Real-time session state tracking
   - Session data persistence

### Database Schema

#### Vision Analysis Table
```sql
CREATE TABLE vision_analysis (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  timestamp BIGINT NOT NULL,
  face_landmarks JSONB,
  face_emotions JSONB,
  eye_contact_data JSONB,
  head_pose JSONB,
  pose_keypoints JSONB,
  posture_scores JSONB,
  hand_landmarks JSONB,
  gesture_data JSONB,
  voice_metrics JSONB,
  confidence_scores JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);
```

### AI Integration Points

1. **Computer Vision Pipeline**:
   - Real-time face detection and landmark extraction
   - Pose estimation and tracking
   - Hand gesture recognition
   - Emotion classification from facial expressions

2. **Speech Analysis Pipeline**:
   - Speech-to-text with confidence scores
   - Voice quality analysis (pitch, volume, pace)
   - Filler word detection and counting
   - Pause analysis for natural speech flow

3. **Confidence Scoring Algorithm**:
   - Multi-factor confidence calculation
   - Focus area weighting based on user preferences
   - Real-time trend analysis
   - Personalized scoring adjustments

## Deployment

### Mobile App Deployment

1. **Web Deployment** (Limited vision features):
```bash
npm run build:web
# Deploy to your web hosting service
```

2. **Native App Deployment** (Full vision features):
```bash
# Build for production
eas build --platform all --profile production

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Backend Deployment Requirements

- **API Server**: Node.js/Express, Python/FastAPI with computer vision libraries
- **WebSocket Server**: Socket.IO server with video stream processing
- **Database**: PostgreSQL with JSONB support for vision data
- **AI Services**: Integration with OpenCV, MediaPipe, and speech analysis APIs
- **GPU Processing**: CUDA-enabled servers for real-time vision analysis
- **CDN**: Content delivery network for MediaPipe models

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support, please contact the development team or create an issue in the repository.

---

**Ready for Production**: This app is designed with production-ready architecture, comprehensive error handling, and scalable computer vision integration. The native development setup enables full OpenCV and MediaPipe capabilities for professional-grade confidence coaching.
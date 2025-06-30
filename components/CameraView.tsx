import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';

// Try importing the DEFAULT export as 'CameraComponent' (or any name you like)
// And specific named exports like PermissionResponse and the CameraType enum.
import CameraType, { Camera as CameraComponent, PermissionResponse, CameraView as CV, useCameraPermissions } from 'expo-camera';

import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface CameraViewProps {
  enabled: boolean;
  onCameraReady?: () => void;
  onError?: (error: string) => void;
}

export default function CameraView({ enabled, onCameraReady, onError }: CameraViewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    let isMounted = true;

    const requestPermissions = async () => {
      if (Platform.OS !== 'web') {
        try {
          // Static methods should be on the imported 'CameraComponent' if it's the main export
          // or on a specific 'Camera' namespace if that's how the library is structured.
          // For now, let's assume 'CameraComponent' holds them.
          const { status }: PermissionResponse = await CameraComponent.requestCameraPermissionsAsync();
          if (isMounted) {
            setHasPermission(status === 'granted');
            if (status !== 'granted') {
              setErrorMsg('Camera permission not granted. Please enable it in settings.');
            } else {
              setErrorMsg(null);
            }
          }
        } catch (err: any) {
          console.error("Error requesting camera permissions:", err.message);
          if (isMounted) {
            setErrorMsg(`Permission error: ${err.message}`);
            setHasPermission(false);
          }
        }
      } else {
        if (isMounted) {
          setHasPermission(true);
          setErrorMsg(null);
        }
      }
    };

    if (enabled) {
      requestPermissions();
    } else {
      if (isMounted) {
        setHasPermission(null);
        setErrorMsg(null);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [enabled]);

  // UI rendering logic (no change from previous correct versions)
  if (!enabled) {
    return (
      <View style={[styles.container, styles.centeredContent, { backgroundColor: colors.gray[200] }]}>
        <Text style={[styles.statusText, { color: colors.gray[500] }]}>Camera Off</Text>
      </View>
    );
  }

  if (hasPermission === null) {
    return (
      <View style={[styles.container, styles.centeredContent, { backgroundColor: colors.gray[100] }]}>
        <Text style={[styles.statusText, { color: colors.gray[600] }]}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.centeredContent, { backgroundColor: colors.gray[200] }]}>
        <Text style={[styles.statusText, { color: colors.error }]}>
          {errorMsg || 'No access to camera.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      {/* Use the imported 'CameraComponent' (which should be the default export) */}
      <CV
        style={styles.cameraPreview}
        facing={"front"}
        onCameraReady={() => console.log("CameraView: Camera is ready")}
        onMountError={(error: { message: string }) => {
          console.error("CameraView: Mount error:", error.message);
          if (Platform.OS === 'web' && error.message.includes("Permission denied")) {
            setErrorMsg("Camera permission denied by browser.");
            setHasPermission(false);
          } else if (error.message) {
            setErrorMsg(`Camera mount error: ${error.message}`);
            setHasPermission(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  cameraContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'black',
  },
  cameraPreview: {
    flex: 1,
  },
});
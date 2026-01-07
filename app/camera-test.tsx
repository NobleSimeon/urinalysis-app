import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; // New Import
import { CameraOff, Camera } from 'lucide-react-native'; // Icons
import { useApp, AnalysisResult } from './_layout';
import { socketService } from '../services/socket';

export default function CameraTestScreen() {
  const router = useRouter();
  const { piIp, setResults } = useApp();
  
  // State
  const [processing, setProcessing] = useState(false);
  const [checkingHardware, setCheckingHardware] = useState(true);
  const [piCameraDetected, setPiCameraDetected] = useState<boolean>(false);

  useEffect(() => {
    // 1. Handle Analysis Results (from Socket)
    const handleSocketResult = (data: AnalysisResult) => {
      processResult(data);
    };

    // 2. Handle Hardware Status
    const handleHardwareStatus = (status: { camera_detected: boolean }) => {
      console.log("Hardware Status:", status);
      setPiCameraDetected(status.camera_detected);
      setCheckingHardware(false);
    };

    // Listeners
    socketService.on('ANALYSIS_COMPLETE', handleSocketResult);
    socketService.on('HARDWARE_STATUS', handleHardwareStatus);

    // Trigger Check
    socketService.emit('CHECK_HARDWARE');

    return () => {
      socketService.off('ANALYSIS_COMPLETE');
      socketService.off('HARDWARE_STATUS');
    };
  }, []);

  // Common function to handle data and navigation
  const processResult = (data: AnalysisResult) => {
    if (data.diagnosis?.advice_layman?.includes("Error")) {
      Alert.alert("Analysis Error", data.diagnosis.advice_layman);
      setProcessing(false);
      return;
    }
    setResults(data);
    setProcessing(false);
    router.push('/results');
  };

  // --- Option A: Capture using Pi Camera (Socket) ---
  const captureWithPi = () => {
    setProcessing(true);
    socketService.emit('TRIGGER_CAPTURE');
  };

  // --- Option B: Capture using Phone Camera (Image Picker) ---
  const captureWithPhone = async () => {
    // 1. Request Permissions
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow camera access to use this feature.");
      return;
    }

    // 2. Launch Camera with Editor
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true, // Allows user to crop the strip
      quality: 0.8,
      aspect: [9,16], // Portrait
      base64: true, // We need this to send to the Pi
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      uploadImage(result.assets[0].base64);
    }
  };

  // Upload Logic for Phone Camera Images
  const uploadImage = async (base64Image: string | null | undefined) => {
    if (!base64Image) return;

    setProcessing(true);
    try {
      const response = await fetch(`http://${piIp}:5000/analyze_external`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });

      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      processResult(data);

    } catch (e: any) {
      Alert.alert("Upload Failed", "Could not reach the Pi or analysis failed.\n" + e.message);
      setProcessing(false);
    }
  };

  // --- RENDERERS ---

  if (checkingHardware) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Connecting to Device...</Text>
      </View>
    );
  }

  // View 1: Pi Camera FOUND (Stream Mode)
  if (piCameraDetected) {
    return (
      <View style={styles.container}>
        {processing && <LoadingOverlay msg="Analyzing Sample..." />}
        
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, { backgroundColor: '#007AFF' }]}>
            <Text style={styles.badgeText}>📷 Connected to Pi Camera</Text>
          </View>
        </View>

        <View style={styles.cameraWrapper}>
          <WebView 
            source={{ uri: `http://${piIp}:5000/video_feed` }}
            style={{ flex: 1 }}
            scrollEnabled={false}
            onError={() => Alert.alert("Stream Error", "Video feed connection lost.")}
          />
          <View style={styles.guideBox} pointerEvents="none" />
        </View>

        <Text style={styles.hint}>Align strip inside the green box</Text>

        <TouchableOpacity style={styles.captureBtn} onPress={captureWithPi} disabled={processing}>
          <Text style={styles.btnText}>CAPTURE & ANALYZE</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // View 2: Pi Camera NOT FOUND (Phone Fallback Mode)
  return (
    <View style={[styles.container, styles.centerContent]}>
      {processing && <LoadingOverlay msg="Uploading & Analyzing..." />}

      <View style={styles.errorCard}>
        <CameraOff size={64} color="#FF3B30" style={{ marginBottom: 20 }} />
        <Text style={styles.errorTitle}>No Camera Detected</Text>
        <Text style={styles.errorSub}>
          The Raspberry Pi does not have a camera module attached.
        </Text>
      </View>

      <Text style={styles.hint}>
        You can use your phone's camera instead. 
        {"\n"}Please crop the image to show ONLY the test strip.
      </Text>

      <TouchableOpacity style={[styles.captureBtn, { backgroundColor: '#FF9500' }]} onPress={captureWithPhone} disabled={processing}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Camera size={24} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.btnText}>USE PHONE CAMERA</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// Helper Component for Loading
const LoadingOverlay = ({ msg }: { msg: string }) => (
  <View style={styles.loadingOverlay}>
    <ActivityIndicator size="large" color="white" />
    <Text style={styles.loadingText}>{msg}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', padding: 20, alignItems: 'center' },
  centerContent: { justifyContent: 'center' },
  
  // Pi Stream Styles
  cameraWrapper: { width: '100%', height: 400, borderRadius: 15, overflow: 'hidden', marginBottom: 20, backgroundColor: '#000' },
  guideBox: { position: 'absolute', top: 50, left: 50, right: 50, bottom: 50, borderWidth: 3, borderColor: '#34C759', borderRadius: 8 },
  badgeContainer: { width: '100%', alignItems: 'center', marginBottom: 15 },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  // No Camera Styles
  errorCard: { alignItems: 'center', marginBottom: 30, padding: 20 },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  errorSub: { textAlign: 'center', color: '#666', marginTop: 10, fontSize: 16 },

  // Shared Styles
  hint: { color: '#666', marginBottom: 20, textAlign: 'center', lineHeight: 20 },
  captureBtn: { backgroundColor: '#34C759', padding: 18, borderRadius: 12, width: '100%', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  
  // Loading
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 15, fontSize: 18, fontWeight: '600' }
});
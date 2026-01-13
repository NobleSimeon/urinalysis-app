// app/(tabs)/home.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as ImagePicker from 'expo-image-picker';
import { CameraOff, Camera } from 'lucide-react-native';
import { useApp } from '@/app/_layout';
import { socketService } from '@/services/socket';
import { apiService } from '@/services/api'; // <--- New API
import ResultView, { AnalysisResult } from '@/components/ResultView';

export default function HomeScreen() {
  const { piIp, userRole } = useApp();
  const [processing, setProcessing] = useState(false);
  const [checkingHardware, setCheckingHardware] = useState(true);
  const [piCameraDetected, setPiCameraDetected] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const handleSocketResult = (data: AnalysisResult) => processResult(data);
    const handleHardwareStatus = (status: { camera_detected: boolean }) => {
      setPiCameraDetected(status.camera_detected);
      setCheckingHardware(false);
    };

    socketService.on('ANALYSIS_COMPLETE', handleSocketResult);
    socketService.on('HARDWARE_STATUS', handleHardwareStatus);
    socketService.emit('CHECK_HARDWARE');

    return () => {
      socketService.off('ANALYSIS_COMPLETE');
      socketService.off('HARDWARE_STATUS');
    };
  }, []);

  const processResult = async (data: AnalysisResult) => {
    if (data.diagnosis?.advice_layman?.includes("Error")) {
      Alert.alert("Analysis Error", data.diagnosis.advice_layman);
      setProcessing(false);
      return;
    }

    // 1. Save to Pi Database automatically
    if (userRole) {
      try {
        await apiService.saveRecord(piIp, data, userRole);
      } catch (e) {
        Alert.alert("Sync Warning", "Result displayed but failed to save to Pi history.");
      }
    }

    // 2. Show Result
    setCurrentResult(data);
    setProcessing(false);
  };

  const captureWithPi = () => { setProcessing(true); socketService.emit('TRIGGER_CAPTURE'); };

  const captureWithPhone = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) return Alert.alert("Permission", "Camera access needed.");
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"], allowsEditing: true,
      quality: 0.8, aspect: [9,16], base64: true,
    });
    if (!res.canceled && res.assets?.[0].base64) uploadImage(res.assets[0].base64);
  };

  const uploadImage = async (base64: string) => {
    setProcessing(true);
    try {
      const resp = await fetch(`http://${piIp}:5000/analyze_external`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      });
      const data = await resp.json();
      if (data.error) throw new Error(data.error);
      processResult(data);
    } catch (e: any) {
      Alert.alert("Upload Failed", "Could not reach the Pi or analysis failed.\n" + e.message);
      setProcessing(false);
    }
  };

  // --- RENDER ---
  if (currentResult) {
    return (
      <ResultView 
        results={currentResult} 
        userRole={userRole || 'LAYMAN'} 
        piIp={piIp} 
        onReset={() => setCurrentResult(null)} 
      />
    );
  }

  if (checkingHardware) return (
        <View style={[styles.container, { justifyContent: 'center' }]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Connecting to Device...</Text>
        </View>
      );

  return (
    <View style={styles.container}>
      {processing && <LoadingOverlay msg="Uploading & Analyzing..." />}
      
      {piCameraDetected ? (
        <>
          <View style={styles.camWrapper}>
             <WebView source={{ uri: `http://${piIp}:5000/video_feed` }} style={{flex:1}} scrollEnabled={false} />
             <View style={styles.guideBox} pointerEvents="none" />
          </View>
          <Text style={styles.hint}>Align strip in green box</Text>
          <TouchableOpacity style={styles.btn} onPress={captureWithPi} disabled={processing}>
            <Text style={styles.btnText}>CAPTURE & ANALYZE</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.center}>
          <CameraOff size={64} color="#FF3B30" />
          <Text style={styles.title}>No Pi Camera Detected</Text>
          <Text style={styles.hint}>ou can use your phone's camera instead. 
        {"\n"}Please crop the image to show ONLY the test strip.</Text>
          <TouchableOpacity style={[styles.btn, {backgroundColor:'#FF9500', marginTop:20}]} onPress={captureWithPhone}>
            <Camera color="#fff" size={20} style={{marginRight:10}}/>
            <Text style={styles.btnText}>USE PHONE CAMERA</Text>
          </TouchableOpacity>
        </View>
      )}
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
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  camWrapper: { height: 400, borderRadius: 15, overflow: 'hidden', backgroundColor: '#000', marginBottom:20 },
  guideBox: { position: 'absolute', top: 50, left: 50, right: 50, bottom: 50, borderWidth: 3, borderColor: '#34C759', borderRadius: 8 },
  btn: { backgroundColor: '#34C759', padding: 18, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, justifyContent:'center', alignItems:'center'},
  title: { fontSize: 20, fontWeight:'bold', marginTop:10},
  hint: { textAlign:'center', color:'#666', marginBottom: 10 },

    // Loading
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: 'white', marginTop: 15, fontSize: 18, fontWeight: '600' }
});
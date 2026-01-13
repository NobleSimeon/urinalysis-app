import React, { useState } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { X, Maximize2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Props {
  base64Image?: string; // Kept for backward compatibility if needed
  imageSource?: string; // NEW: Can be Base64 OR a filename (e.g., "img_123.jpg")
  piIp?: string;        // NEW: Needed to construct the URL if it's a filename
  label?: string;
}

export default function ZoomableImage({ base64Image, imageSource, piIp, label }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  // --- SMART SOURCE RESOLUTION ---
  // Use imageSource if available, fallback to base64Image for safety
  const rawSource = imageSource || base64Image;

  if (!rawSource) return null;

  let finalUri = '';

  // Check if it's a raw Base64 string (starts with 'data:' OR is very long)
  // URLs are usually short (<200 chars), Base64 images are huge (>1000 chars)
  if (rawSource.startsWith('data:') || rawSource.length > 500) {
    // Case A: It's a raw Base64 string (from Live Camera)
    finalUri = rawSource.startsWith('data:') 
      ? rawSource 
      : `data:image/jpeg;base64,${rawSource}`;
  } else {
    // Case B: It's a filename from the Database (History)
    // We assume the Pi serves images at /uploads/
    // Default to a placeholder IP if piIp is missing, though it should be provided
    const ip = piIp || '192.168.4.1'; 
    finalUri = `http://${ip}:5000/uploads/${rawSource}`;
  }

  // --- GESTURE LOGIC (Preserved) ---
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = savedScale.value * e.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        savedScale.value = scale.value;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const resetZoom = () => {
    scale.value = withSpring(1);
    savedScale.value = 1;
    setModalVisible(false);
  };

  return (
    <View style={styles.thumbnailContainer}>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Animated.Image 
          source={{ uri: finalUri }} 
          style={styles.thumbnail} 
          resizeMode="cover"
        />
        <View style={styles.overlay}>
          <Maximize2 color="white" size={20} />
        </View>
      </TouchableOpacity>
      {label && <Text style={styles.label}>{label}</Text>}

      <Modal visible={modalVisible} transparent={true} onRequestClose={resetZoom}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalBackground}>
            <TouchableOpacity style={styles.closeBtn} onPress={resetZoom}>
              <X color="white" size={32} />
            </TouchableOpacity>

            <GestureDetector gesture={pinch}>
              <Animated.Image
                source={{ uri: finalUri }}
                style={[styles.fullImage, animatedStyle]}
                resizeMode="contain"
              />
            </GestureDetector>
            
            <Text style={styles.hint}>Pinch to Zoom</Text>
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  thumbnailContainer: { marginBottom: 20, width: '100%', alignItems: 'center' },
  thumbnail: { width: width - 40, height: 150, borderRadius: 10, backgroundColor: '#ddd' },
  label: { marginTop: 5, color: '#666', fontSize: 12, fontWeight: '600' },
  overlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 5, borderRadius: 5 },
  modalBackground: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  fullImage: { width: '100%', height: '100%' },
  closeBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
  hint: { position: 'absolute', bottom: 40, color: 'white', opacity: 0.7 }
});
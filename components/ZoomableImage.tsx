import React, { useState } from 'react';
import { Modal, StyleSheet, View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { X, Maximize2 } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Props {
  base64Image: string;
  label?: string;
}

export default function ZoomableImage({ base64Image, label }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

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

  if (!base64Image) return null;

  return (
    <View style={styles.thumbnailContainer}>
      <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.8}>
        <Animated.Image 
          source={{ uri: `data:image/jpeg;base64,${base64Image}` }} 
          style={styles.thumbnail} 
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
                source={{ uri: `data:image/jpeg;base64,${base64Image}` }}
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
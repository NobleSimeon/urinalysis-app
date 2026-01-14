import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Save, Camera } from 'lucide-react-native';
import { useApp } from '../_layout';
import { apiService } from '../../services/api';

export default function ProfileScreen() {
  const { piIp, setPiIp, userRole } = useApp();
  
  // Form State
  const [name, setName] = useState("Loading...");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [newAvatarBase64, setNewAvatarBase64] = useState<string | null>(null);
  
  // UI State
  const [loading, setLoading] = useState(false);
  
  // Configuration State
  const [localIp, setLocalIp] = useState(piIp);
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPass, setWifiPass] = useState("");

  // 1. Fetch Profile on Screen Focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [piIp])
  );

  const loadProfile = async () => {
    setLoading(true);
    const data = await apiService.getProfile(piIp);
    if (data) {
      setName(data.name);
      if (data.avatar) {
        setAvatarUrl(`http://${piIp}:5000/uploads/${data.avatar}`);
      }
    } else {
        setName("User (Offline)");
    }
    setLoading(false);
  };

  // 2. Pick Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
        setAvatarUrl(result.assets[0].uri);
        setNewAvatarBase64(result.assets[0].base64);
    }
  };

  // 3. Save Changes
  const handleSave = async () => {
    setLoading(true);
    try {
      setPiIp(localIp);

      // --- UPDATED CALL: Pass Wi-Fi details ---
      const res = await apiService.updateProfile(
        localIp, 
        name, 
        newAvatarBase64, 
        wifiSSID, 
        wifiPass
      );
      
      if (res.success) {
        let msg = "Profile updated successfully.";
        
        // Check if Wi-Fi was updated
        if (res.wifi_updated) {
            msg += "\n\n⚠️ Wi-Fi settings changed. You must REBOOT the Pi for changes to take effect.";
        }

        Alert.alert("Success", msg);
        
        // Update Avatar URL if changed
        if (res.avatar) {
            setAvatarUrl(`http://${localIp}:5000/uploads/${res.avatar}`);
            setNewAvatarBase64(null);
        }
        
        // Clear Wi-Fi fields for security
        setWifiSSID("");
        setWifiPass("");
      }
    } catch (e) {
      Alert.alert("Error", "Could not save profile. Check connection to Pi.");
    }
    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Avatar Section */}
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
        ) : avatarUrl ? (
            <Image 
                source={{ uri: avatarUrl, headers: { Pragma: 'no-cache' } }} 
                style={styles.avatar} 
                key={Date.now()} 
            />
        ) : (
            <View style={[styles.avatar, styles.placeholder]}>
                <Camera color="#fff" size={40} />
            </View>
        )}
        <Text style={styles.editPhoto}>Tap to Change Photo</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Display Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <View style={styles.divider} />

      <Text style={styles.header}>Raspberry Pi Configuration</Text>
      
      <Text style={styles.label}>System IP Address</Text>
      <TextInput style={styles.input} value={localIp} onChangeText={setLocalIp} keyboardType="numeric"/>

      <Text style={styles.label}>Pi Wi-Fi SSID (Update)</Text>
      <TextInput 
        style={styles.input} 
        value={wifiSSID} 
        onChangeText={setWifiSSID} 
        placeholder="Enter new Wi-Fi Name (Optional)"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Pi Wi-Fi Password</Text>
      <TextInput 
        style={styles.input} 
        value={wifiPass} 
        onChangeText={setWifiPass} 
        secureTextEntry 
        placeholder="Enter new Password (Optional)"
      />

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Save color="white" size={20} style={{marginRight:10}}/>}
        <Text style={styles.btnText}>Save Changes</Text>
      </TouchableOpacity>

      <Text style={styles.roleDisplay}>Current App Role: {userRole}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F5F5F7', padding: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#fff' },
  placeholder: { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  editPhoto: { color: '#007AFF', marginTop: 10, fontWeight: '600' },
  header: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#333' },
  label: { color: '#666', marginBottom: 5, fontSize: 12 },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },
  saveBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },
  roleDisplay: { textAlign: 'center', marginTop: 30, color: '#999', paddingBottom: 30 }
});
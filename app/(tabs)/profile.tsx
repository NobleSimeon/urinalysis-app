import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useApp } from '@/app/_layout';
import * as ImagePicker from 'expo-image-picker';
import { Save, Camera } from 'lucide-react-native';

export default function ProfileScreen() {
  const { piIp, setPiIp, userRole } = useApp();
  const [name, setName] = useState("User");
  const [avatar, setAvatar] = useState<string | null>(null);
  
  // Local state for Pi Config (only save on button press)
  const [localIp, setLocalIp] = useState(piIp);
  const [wifiSSID, setWifiSSID] = useState("");
  const [wifiPass, setWifiPass] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const handleSave = () => {
    setPiIp(localIp);
    // Here you would also save name/avatar to AsyncStorage if desired
    // And potentially emit a socket event to update Pi Wi-Fi if functionality existed
    Alert.alert("Success", "Profile and Configuration updated.");
  };

  return (
    <View style={styles.container}>
      {/* Avatar Section */}
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
            <View style={[styles.avatar, styles.placeholder]}>
                <Camera color="#fff" size={40} />
            </View>
        )}
        <Text style={styles.editPhoto}>Edit Photo</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Display Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      <View style={styles.divider} />

      <Text style={styles.header}>Raspberry Pi Configuration</Text>
      
      <Text style={styles.label}>System IP Address</Text>
      <TextInput style={styles.input} value={localIp} onChangeText={setLocalIp} keyboardType="numeric"/>

      <Text style={styles.label}>Pi Wi-Fi SSID (Update)</Text>
      <TextInput style={styles.input} value={wifiSSID} onChangeText={setWifiSSID} placeholder="Enter new Wi-Fi Name"/>

      <Text style={styles.label}>Pi Wi-Fi Password</Text>
      <TextInput style={styles.input} value={wifiPass} onChangeText={setWifiPass} secureTextEntry placeholder="Enter new Password"/>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Save color="white" size={20} style={{marginRight:10}}/>
        <Text style={styles.btnText}>Save Changes</Text>
      </TouchableOpacity>

      <Text style={styles.roleDisplay}>Current Role: {userRole}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', padding: 20 },
  avatarContainer: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  placeholder: { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
  editPhoto: { color: '#007AFF', marginTop: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginVertical: 15, color: '#333' },
  label: { color: '#666', marginBottom: 5, fontSize: 12 },
  input: { backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ddd' },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 10 },
  saveBtn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: 'white', fontWeight: 'bold' },
  roleDisplay: { textAlign: 'center', marginTop: 30, color: '#999' }
});
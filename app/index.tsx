import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Wifi } from 'lucide-react-native';
import { useApp } from './_layout';
import { socketService } from '../services/socket';

export default function DiscoveryScreen() {
  const router = useRouter();
  const { piIp, setPiIp } = useApp();
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    setLoading(true);
    try {
      await socketService.connect(piIp);
      setLoading(false);
      router.push('/user-type');
    } catch (e) {
      setLoading(false);
      Alert.alert("Connection Failed", "Ensure Pi is on same network.");
    }
  };

  return (
    <View style={styles.container}>
      <Wifi color="#007AFF" size={64} style={{ marginBottom: 20 }} />
      <Text style={styles.title}>Urine Diagnosis Hub</Text>
      
      <TextInput 
        style={styles.input} 
        value={piIp} 
        onChangeText={setPiIp} 
        placeholder="192.168.X.X" 
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.btn} onPress={connect} disabled={loading}>
        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Find Device</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F7', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 10, width: '80%', marginBottom: 20, fontSize: 18, textAlign: 'center', borderWidth: 1, borderColor: '#ddd' },
  btn: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, width: '80%', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
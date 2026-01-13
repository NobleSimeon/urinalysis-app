import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Stethoscope, User } from 'lucide-react-native';
import { useApp } from './_layout';

export default function UserTypeScreen() {
  const router = useRouter();
  const { setUserRole } = useApp();

  const select = (role: 'MEDICAL' | 'LAYMAN') => {
    setUserRole(role);
    router.push('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Who is using this device?</Text>

      <TouchableOpacity style={styles.card} onPress={() => select('MEDICAL')}>
        <Stethoscope color="#007AFF" size={32} />
        <View style={styles.textContainer}>
          <Text style={styles.roleTitle}>Medical Personnel</Text>
          <Text style={styles.roleSub}>Detailed charts & calibration data</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => select('LAYMAN')}>
        <User color="#444" size={32} />
        <View style={styles.textContainer}>
          <Text style={styles.roleTitle}>Personal User</Text>
          <Text style={styles.roleSub}>Simple advice & summary</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F7', paddingTop: 40 },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 30, color: '#333' },
  card: { flexDirection: 'row', backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', elevation: 2 },
  textContainer: { marginLeft: 15 },
  roleTitle: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
  roleSub: { color: '#666', marginTop: 4 }
});
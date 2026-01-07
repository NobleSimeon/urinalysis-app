import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from './_layout';
import ZoomableImage from '../components/ZoomableImage'; // 
import { FileText, Send, Database, RefreshCw } from 'lucide-react-native';

const ANALYTES = ["Leukocytes", "Nitrites", "Urobilinogen", "Protein", "pH", "Blood", "SpecificGravity", "Ketone", "Bilirubin", "Glucose"];

export default function ResultsScreen() {
  const router = useRouter();
  const { results, userRole } = useApp();

  if (!results) return <Text>No data available.</Text>;

  const isMedical = userRole === 'MEDICAL';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 1. Diagnosis Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FileText color="#007AFF" size={20} />
          <Text style={styles.cardTitle}>Diagnosis</Text>
        </View>
        <Text style={styles.diagnosisText}>
          {isMedical ? results.diagnosis.advice_medical : results.diagnosis.advice_layman}
        </Text>
      </View>

      {/* 2. Captured Strip (Zoomable) */}
      <ZoomableImage base64Image={results.image} label="Captured Sample (Tap to Zoom)" />

      {/* 3. Medical Only: Reference Chart */}
      {isMedical && results.reference_chart && (
        <ZoomableImage base64Image={results.reference_chart} label="Reference Standard" />
      )}

      {/* 4. Detailed Grid */}
      <Text style={styles.sectionHeader}>Detailed Parameters</Text>
      <View style={styles.grid}>
        {ANALYTES.map((key) => (
          <View key={key} style={styles.gridItem}>
            <Text style={styles.analyteLabel}>{key}</Text>
            <Text style={styles.analyteValue}>{results.full_results[key] || '-'}</Text>
          </View>
        ))}
      </View>

      {/* 5. Actions */}
      <View style={styles.actionContainer}>
        {isMedical ? (
          <>
            <TouchableOpacity style={styles.medBtn} onPress={() => Alert.alert("Synced", "Data saved to Hospital DB")}>
              <Database color="white" size={20} style={{ marginRight: 10 }} />
              <Text style={styles.btnText}>Sync to DB</Text>
            </TouchableOpacity>
            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionTitle}>Suggested Tests:</Text>
              <Text style={styles.suggestionText}>• Urine Culture (Reflex)</Text>
              <Text style={styles.suggestionText}>• Microscopic Exam</Text>
            </View>
          </>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Sent", "Report emailed to doctor.")}>
            <Send color="white" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.btnText}>Send to Doctor</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.resetBtn} onPress={() => router.dismissTo('/camera-test')}>
          <RefreshCw color="#666" size={20} style={{ marginRight: 10 }} />
          <Text style={styles.resetText}>Run New Test</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50, backgroundColor: '#F5F5F7' },
  card: { backgroundColor: 'white', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: '#333' },
  diagnosisText: { fontSize: 16, lineHeight: 24, color: '#444' },
  sectionHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, marginTop: 10, color: '#333' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '48%', backgroundColor: 'white', padding: 12, borderRadius: 8, marginBottom: 10 },
  analyteLabel: { fontSize: 12, color: '#888' },
  analyteValue: { fontSize: 16, fontWeight: 'bold', color: '#007AFF' },
  actionContainer: { marginTop: 20 },
  actionBtn: { backgroundColor: '#34C759', flexDirection: 'row', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  medBtn: { backgroundColor: '#5856D6', flexDirection: 'row', padding: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  suggestionBox: { padding: 15, backgroundColor: '#EEF2FF', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#5856D6' },
  suggestionTitle: { fontWeight: 'bold', color: '#5856D6', marginBottom: 5 },
  suggestionText: { color: '#444' },
  resetBtn: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, alignItems: 'center' },
  resetText: { color: '#666', fontSize: 16 }
});
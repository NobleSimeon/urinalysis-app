// components/ResultView.tsx
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";
import * as Speech from "expo-speech";
import { FileText, Send, Database, RefreshCw, Volume2, VolumeX, ArrowLeft } from "lucide-react-native";
import ZoomableImage from "./ZoomableImage";

export interface DiagnosisData {
  leukocytes: string;
  nitrites: string;
  advice_medical: string;
  advice_layman: string;
}

export interface AnalysisResult {
  diagnosis: DiagnosisData;
  image: string;
  full_results: Record<string, string>;
  reference_chart: string;
  timestamp?: string;
  id?: number; // DB ID
}

interface ResultViewProps {
  results: AnalysisResult;
  userRole: "MEDICAL" | "LAYMAN";
  piIp: string;       // <--- NEW PROP
  onReset?: () => void;
  onBack?: () => void;
}

const ANALYTES = ["Leukocytes", "Nitrites", "Urobilinogen", "Protein", "pH", "Blood", "SpecificGravity", "Ketone", "Bilirubin", "Glucose"];

export default function ResultView({ results, userRole, piIp, onReset, onBack }: ResultViewProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isMedical = userRole === "MEDICAL";

  useEffect(() => {
    if (onReset) readResults(); // Only auto-speak on new test
    return () => {Speech.stop()};
  }, []);

  const readResults = () => {
    if (!results) return;
    const diagnosisText = isMedical ? results.diagnosis.advice_medical : results.diagnosis.advice_layman;
    let speechText = `Analysis Complete. Diagnosis: ${diagnosisText}. Here are the detailed parameters: `;
    ANALYTES.forEach((key) => {
      const val = results.full_results[key] || "Not detected";
      speechText += `${key}: ${val}. `;
    });
    setIsSpeaking(true);
    Speech.speak(speechText, {
      language: "en", pitch: 1.0, rate: 0.9,
      onDone: () => setIsSpeaking(false), onStopped: () => setIsSpeaking(false),
    });
  };

  const toggleSpeech = () => {
    if (isSpeaking) { Speech.stop(); setIsSpeaking(false); } 
    else { readResults(); }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Back Button (History Mode) */}
      {onBack && (
        <TouchableOpacity style={styles.backBtnHeader} onPress={onBack}>
          <ArrowLeft size={24} color="#007AFF" />
          <Text style={styles.backBtnText}>Back to History</Text>
        </TouchableOpacity>
      )}

      {/* Diagnosis Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FileText color="#007AFF" size={20} />
          <Text style={[styles.cardTitle, { flex: 1 }]}>Diagnosis</Text>
          <TouchableOpacity onPress={toggleSpeech}>
            {isSpeaking ? <VolumeX color="#FF3B30" size={24} /> : <Volume2 color="#007AFF" size={24} />}
          </TouchableOpacity>
        </View>
        <Text style={styles.diagnosisText}>
          {isMedical ? results.diagnosis.advice_medical : results.diagnosis.advice_layman}
        </Text>
        {results.timestamp && (
          <Text style={styles.timestamp}>Recorded: {new Date(results.timestamp).toLocaleString()}</Text>
        )}
      </View>

      {/* Captured Strip (Passes piIp) */}
      <ZoomableImage base64Image={results.image} imageSource={results.image} piIp={piIp} label="Captured Sample" />

      {/* Reference Chart (Medical Only) */}
      {isMedical && results.reference_chart && (
        <ZoomableImage base64Image={results.reference_chart} imageSource={results.reference_chart} piIp={piIp} label="Reference Standard" />
      )}

      {/* Detailed Grid */}
      <Text style={styles.sectionHeader}>Detailed Parameters</Text>
      <View style={styles.grid}>
        {ANALYTES.map((key) => (
          <View key={key} style={styles.gridItem}>
            <Text style={styles.analyteLabel}>{key}</Text>
            <Text style={styles.analyteValue}>{results.full_results[key] || "-"}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actionContainer}>
        {isMedical ? (
          <TouchableOpacity style={styles.medBtn} onPress={() => Alert.alert("Synced", "Data saved to Hospital DB")}>
            <Database color="white" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.btnText}>Sync to DB</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert("Sent", "Report emailed to doctor.")}>
            <Send color="white" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.btnText}>Send to Doctor</Text>
          </TouchableOpacity>
        )}

        {onReset && (
          <TouchableOpacity style={styles.resetBtn} onPress={() => { Speech.stop(); onReset(); }}>
            <RefreshCw color="#666" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.resetText}>Run New Test</Text>
          </TouchableOpacity>
        )}

        {onBack && (
          <TouchableOpacity style={styles.resetBtn} onPress={() => { Speech.stop(); onBack(); }}>
            <ArrowLeft color="#666" size={20} style={{ marginRight: 10 }} />
            <Text style={styles.resetText}>Back to List</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 50, backgroundColor: "#F5F5F7" },
  backBtnHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  backBtnText: { color: '#007AFF', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  card: { backgroundColor: "white", padding: 20, borderRadius: 12, marginBottom: 20, elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 8, color: "#333" },
  diagnosisText: { fontSize: 16, lineHeight: 24, color: "#444" },
  timestamp: { fontSize: 12, color: "#999", marginTop: 10, fontStyle: "italic" },
  sectionHeader: { fontSize: 18, fontWeight: "bold", marginBottom: 10, marginTop: 10, color: "#333" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { width: "48%", backgroundColor: "white", padding: 12, borderRadius: 8, marginBottom: 10 },
  analyteLabel: { fontSize: 12, color: "#888" },
  analyteValue: { fontSize: 16, fontWeight: "bold", color: "#007AFF" },
  actionContainer: { marginTop: 20 },
  actionBtn: { backgroundColor: "#34C759", flexDirection: "row", padding: 16, borderRadius: 12, justifyContent: "center", alignItems: 'center' },
  medBtn: { backgroundColor: "#5856D6", flexDirection: "row", padding: 16, borderRadius: 12, justifyContent: "center", alignItems: 'center', marginBottom: 15 },
  btnText: { color: "white", fontWeight: "bold", fontSize: 16 },
  resetBtn: { flexDirection: "row", justifyContent: "center", marginTop: 30, alignItems: "center", padding: 10 },
  resetText: { color: "#666", fontSize: 16 },
});
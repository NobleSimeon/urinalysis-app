// app/(tabs)/history.tsx
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useApp } from '@/app/_layout';
import { apiService } from '@/services/api'; // <--- New API
import { ChevronRight } from 'lucide-react-native';
import ResultView, { AnalysisResult } from '@/components/ResultView';

export default function HistoryScreen() {
  const { piIp, userRole } = useApp();
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedItem, setSelectedItem] = useState<AnalysisResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    if (userRole) {
      const data = await apiService.getHistory(piIp, userRole);
      setHistory(data);
    }
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => { loadData(); }, [userRole])
  );

  if (selectedItem) {
    return (
      <ResultView 
        results={selectedItem} 
        userRole={userRole || 'LAYMAN'} 
        piIp={piIp}
        onBack={() => setSelectedItem(null)} 
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{userRole === 'MEDICAL' ? 'Patient Records' : 'My Previous Tests'}</Text>
      
      <FlatList
        data={history}
        keyExtractor={(item, index) => (item.id ? item.id.toString() : index.toString())}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData}/>}
        ListEmptyComponent={<Text style={styles.empty}>No records found on Pi.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => setSelectedItem(item)}>
            <View>
                <Text style={styles.date}>
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Unknown Date'}
                </Text>
                <Text style={styles.summary}>
                    {userRole === 'MEDICAL' 
                      ? item.diagnosis.advice_medical.substring(0,40)+'...' 
                      : item.diagnosis.advice_layman.substring(0,40)+'...'}
                </Text>
            </View>
            <ChevronRight color="#ccc" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7', padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  item: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontWeight: 'bold', color: '#007AFF', marginBottom: 4 },
  summary: { color: '#666', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});
import React, { createContext, useContext, useState, useEffect } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Power } from 'lucide-react-native';
import { socketService } from '../services/socket';

// --- 1. Global Context Types ---
interface DiagnosisData {
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
}

interface AppContextType {
  piIp: string;
  setPiIp: (ip: string) => void;
  userRole: 'MEDICAL' | 'LAYMAN' | null;
  setUserRole: (role: 'MEDICAL' | 'LAYMAN') => void;
  results: AnalysisResult | null;
  setResults: (res: AnalysisResult) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// --- 2. Layout Component ---
export default function RootLayout() {
  const router = useRouter();
  // const [piIp, setPiIp] = useState('192.168.67.237');
  const [piIp, setPiIp] = useState('192.168.4.1'); // Hotspot Default
  const [userRole, setUserRole] = useState<'MEDICAL' | 'LAYMAN' | null>(null);
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const handleShutdown = () => {
    Alert.alert("Shutdown System", "Are you sure you want to turn off the Pi?", [
      { text: "Cancel", style: "cancel" },
      { text: "Shutdown", style: "destructive", onPress: async() => {
  
          try {
            socketService.shutdown()
            
            // 2. Clear the navigation stack
            router.dismissAll();
            
            // 3. Replace current screen with Index (Login/Start)
            router.replace('/'); 
            
          } catch (error) {
            console.error("Shutdown failed", error);
          }

        } }
    ]);
  };

  return (
    <AppContext.Provider value={{ piIp, setPiIp, userRole, setUserRole, results, setResults }}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F5F5F7' },
          headerTintColor: '#333',
          headerTitleStyle: { fontWeight: 'bold' },
          headerRight: () => (
            <TouchableOpacity onPress={handleShutdown} style={{ marginRight: 15 }}>
              <Power color="#FF3B30" size={24} />
            </TouchableOpacity>
          ),
        }}
      >
        <Stack.Screen name="index" options={{ title: "Discovery" }} />
        <Stack.Screen name="user-type" options={{ title: "Select Role" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AppContext.Provider>
  );
}
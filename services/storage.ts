import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnalysisResult } from '@/app/_layout';

const HIST_KEY_MED = 'HISTORY_MEDICAL';
const HIST_KEY_LAY = 'HISTORY_LAYMAN';
const PROFILE_KEY = 'USER_PROFILE';

export const saveResultToHistory = async (result: AnalysisResult, role: 'MEDICAL' | 'LAYMAN') => {
  try {
    const key = role === 'MEDICAL' ? HIST_KEY_MED : HIST_KEY_LAY;
    const existing = await AsyncStorage.getItem(key);
    const history = existing ? JSON.parse(existing) : [];
    
    // Add timestamp and new result to start of array
    const newEntry = { ...result, timestamp: new Date().toISOString() };
    const updated = [newEntry, ...history];
    
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to save history", e);
  }
};

export const getHistory = async (role: 'MEDICAL' | 'LAYMAN') => {
  try {
    const key = role === 'MEDICAL' ? HIST_KEY_MED : HIST_KEY_LAY;
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
};
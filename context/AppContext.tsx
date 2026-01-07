import React, { createContext, useContext, useState } from 'react';

// Define the shape of the Analysis Data
export interface AnalysisResult {
  diagnosis: {
    leukocytes?: string;
    nitrites?: string;
    advice_medical: string;
    advice_layman: string;
  };
  image: string; // Base64 image
  full_results: Record<string, any>;
  reference_chart: string;
}

interface AppContextType {
  piIp: string;
  setPiIp: (ip: string) => void;
  userRole: 'MEDICAL' | 'LAYMAN';
  setUserRole: (role: 'MEDICAL' | 'LAYMAN') => void;
  results: AnalysisResult | null;
  setResults: (res: AnalysisResult) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default IP (Hotspot Default)
  const [piIp, setPiIp] = useState('192.168.4.1');
  const [userRole, setUserRole] = useState<'MEDICAL' | 'LAYMAN'>('LAYMAN');
  const [results, setResults] = useState<AnalysisResult | null>(null);

  return (
    <AppContext.Provider value={{ piIp, setPiIp, userRole, setUserRole, results, setResults }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
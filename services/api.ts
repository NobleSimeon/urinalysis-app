// services/api.ts
import { AnalysisResult } from '@/components/ResultView';

export const apiService = {
  /**
   * Sends the analysis result (including Base64 images) to the Pi database.
   */
  saveRecord: async (piIp: string, result: AnalysisResult, role: 'MEDICAL' | 'LAYMAN') => {
    try {
      const response = await fetch(`http://${piIp}:5000/save_record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...result,
          role: role, // Add role so the server knows where to file it
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error: ${errText}`);
      }
      
      console.log("Record saved to Pi Database successfully.");
      return true;
    } catch (error) {
      console.error("Failed to save record:", error);
      throw error;
    }
  },

  /**
   * Fetches history list from the Pi.
   */
  getHistory: async (piIp: string, role: 'MEDICAL' | 'LAYMAN') => {
    try {
      const response = await fetch(`http://${piIp}:5000/get_history/${role}`);
      if (!response.ok) throw new Error("Failed to fetch history");
      return await response.json();
    } catch (error) {
      console.error("History fetch error:", error);
      return [];
    }
  }
};
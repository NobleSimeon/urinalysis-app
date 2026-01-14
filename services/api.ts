import { AnalysisResult } from '../components/ResultView';

export const apiService = {
  /**
   * Sends the analysis result (including Base64 images) to the Pi database.
   */
  saveRecord: async (piIp: string, result: AnalysisResult, role: 'MEDICAL' | 'LAYMAN') => {
    try {
      const response = await fetch(`http://${piIp}:5000/save_record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...result, role }),
      });

      if (!response.ok) throw new Error(await response.text());
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
  },

  // --- NEW: PROFILE METHODS ---

  /**
   * Gets the current Name and Avatar Filename from the Pi.
   */
  getProfile: async (piIp: string) => {
    try {
      const response = await fetch(`http://${piIp}:5000/get_profile`);
      if (!response.ok) throw new Error("Failed to fetch profile");
      return await response.json(); // Returns { name: "...", avatar: "..." }
    } catch (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
  },

  /**
   * Updates Name and/or Avatar on the Pi.
   */
  updateProfile: async (
    piIp: string, 
    name: string, 
    base64Image?: string | null,
    wifiSSID?: string,     // <--- NEW PARAM
    wifiPass?: string      // <--- NEW PARAM
  ) => {
    try {
      // Build the body dynamically
      const body: any = { name };
      
      if (base64Image) body.image = base64Image;
      if (wifiSSID) body.wifiSSID = wifiSSID;  // <--- Add to body
      if (wifiPass) body.wifiPass = wifiPass;  // <--- Add to body

      const response = await fetch(`http://${piIp}:5000/update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to update profile");
      return await response.json(); 
      // Returns { success: true, avatar: "...", wifi_updated: true/false }
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  }
};
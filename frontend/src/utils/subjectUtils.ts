import ApiService from '../services/ApiService';

// Fetch subjects using centralized ApiService
export const fetchSubjects = async (): Promise<string[]> => {
  try {
    return await ApiService.getSubjects();
  } catch (error) {
    console.error("Error fetching subjects:", error);
    // Return default subjects if API fails
    return ["一般", "英文", "體育", "音樂", "美術", "資訊", "特教", "行政"];
  }
};
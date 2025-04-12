import ApiService from '../services/ApiService';

// Fetch available subjects from the API
export async function fetchSubjects(): Promise<string[]> {
  try {
    const subjects = await ApiService.getSubjects();
    return subjects;
  } catch (error) {
    console.error('Error fetching subjects:', error);
    // Return default subjects in case of API failure
    return [
      '一般', '國文', '英文', '數學', '物理', '化學', '生物', 
      '地球科學', '歷史', '地理', '公民', '音樂', '美術', 
      '體育', '資訊', '輔導', '特教', '其他'
    ];
  }
}
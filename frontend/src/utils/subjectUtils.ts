// Fetch subjects from API
export const fetchSubjects = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subjects`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch subjects: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching subjects:", error);
    // Return default subjects if API fails
    return ["一般", "英文", "體育", "音樂", "美術", "資訊", "特教", "行政"];
  }
};

// ...existing code...
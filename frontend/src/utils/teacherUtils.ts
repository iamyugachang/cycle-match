import { Teacher } from '../types';

// Update a teacher record
export const updateTeacher = async (teacherId: number, teacherData: Teacher): Promise<Teacher> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers/${teacherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teacherData),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update teacher: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error updating teacher:", error);
    throw error;
  }
};

// Get teacher list by Google ID
export const getTeachersByGoogleId = async (googleId: string): Promise<Teacher[]> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers?google_id=${googleId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch teachers: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return [];
  }
};

// Get all matches
export const getMatches = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch matches: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
};

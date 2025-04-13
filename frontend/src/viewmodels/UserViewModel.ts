import { useState, useEffect } from 'react';
import { Teacher, UserInfo, UserResponse } from '../types';
import ApiService from '../services/ApiService';

export const useUserViewModel = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]); // All teachers associated with current user
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null); // Track which teacher is being edited
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Try to restore user session from localStorage on mount
  // Inside the useEffect at the beginning of the hook
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('user_info');
    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo);
        setUserInfo(parsedUserInfo);
        
        // Fetch teacher data for this user
        const fetchTeachersData = async () => {
          if (parsedUserInfo.google_id) {
            try {
              const teachers = await ApiService.getTeachersByGoogleId(parsedUserInfo.google_id);
              
              if (teachers && teachers.length > 0) {
                setAllTeachers(teachers);
                setCurrentTeacher(teachers[0]);
              } else {
                console.warn("No teachers found for user");
              }
            } catch (err) {
              console.error("Failed to restore teacher data:", err);
            }
          }
        };
        
        fetchTeachersData();
      } catch (err) {
        console.error("Failed to parse stored user info:", err);
      }
    }
  }, []);
  
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    setLoading(true);
    setError("");
  
    try {
      // Use centralized API service to handle Google login
      const data = await ApiService.googleLogin(token);
      
      // Update user info
      setUserInfo(data.userInfo);
      
      // Set all associated teacher records - ensure this is working
      setAllTeachers(data.teachers);
      
      // Set current teacher (first one by default or specified teacher)
      if (data.teachers.length > 0) {
        setCurrentTeacher(data.teachers[0]);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Google 登入驗證失敗，請稍後再試";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLoginFailure = (error: any) => {
    console.error("Google 登入失敗:", error);
    setError("Google 登入失敗，請稍後再試");
  };

  const logout = () => {
    setUserInfo(null);
    setCurrentTeacher(null);
    setAllTeachers([]);
    setEditingTeacher(null);
    
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('google_id');
    localStorage.removeItem('user_info');
  };

  // Switch between teacher records for the same user
  const switchTeacher = (teacherId: number) => {
    const teacher = allTeachers.find(t => t.id === teacherId);
    if (teacher) {
      setCurrentTeacher(teacher);
      return true;
    }
    return false;
  };

  // Start editing a teacher
  const startEditingTeacher = (teacherId: number) => {
    const teacher = allTeachers.find(t => t.id === teacherId);
    if (teacher) {
      setEditingTeacher(teacher);
      return true;
    }
    return false;
  };

  // Cancel editing a teacher
  const cancelEditingTeacher = () => {
    setEditingTeacher(null);
  };

  // Update a teacher record
  const updateTeacher = async (updatedTeacher: Teacher) => {
    if (!updatedTeacher.id) {
      setError("找不到要更新的教師ID");
      return null;
    }

    setLoading(true);
    setError("");

    try {
      const updated = await ApiService.updateTeacher(updatedTeacher.id, updatedTeacher);
      
      // Update all teachers list
      const updatedTeachers = allTeachers.map(t => 
        t.id === updated.id ? updated : t
      );
      setAllTeachers(updatedTeachers);
      
      // Update current teacher if needed
      if (currentTeacher?.id === updated.id) {
        setCurrentTeacher(updated);
      }
      
      // Clear editing state
      setEditingTeacher(null);
      
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新教師資料失敗，請稍後再試";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a teacher record
  const deleteTeacher = async (teacherId: number) => {
    setLoading(true);
    setError("");

    try {
      await ApiService.deleteTeacher(teacherId);
      
      // Remove from all teachers
      const remainingTeachers = allTeachers.filter(t => t.id !== teacherId);
      setAllTeachers(remainingTeachers);
      
      // Update current teacher if needed
      if (currentTeacher?.id === teacherId) {
        setCurrentTeacher(remainingTeachers.length > 0 ? remainingTeachers[0] : null);
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "刪除教師資料失敗，請稍後再試";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Debug login (for development/testing)
  const debugLogin = async (googleId: string) => {
    if (!googleId) return null;
    
    const mockUserInfo = {
      name: "Debug User",
      picture: "",
      email: googleId,
      google_id: googleId,
    };
    
    setUserInfo(mockUserInfo);
    setLoading(true);

    try {
      // Fetch teacher data for this Google ID
      const teachers = await ApiService.getTeachersByGoogleId(googleId);
      
      setAllTeachers(teachers);
      
      if (teachers.length > 0) {
        // Set first teacher as current
        setCurrentTeacher(teachers[0]);
        return { 
          userInfo: mockUserInfo, 
          teacher: teachers[0],
          teachers: teachers
        };
      }
      
      // No teacher data
      return { 
        userInfo: mockUserInfo, 
        teacher: null,
        teachers: []
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "獲取教師資料失敗，請稍後再試";
      setError(errorMessage);
      return { 
        userInfo: mockUserInfo, 
        teacher: null,
        teachers: []
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    userInfo,
    currentTeacher,
    allTeachers,
    editingTeacher,
    loading,
    error,
    setUserInfo,
    setCurrentTeacher,
    setAllTeachers,
    handleGoogleLoginSuccess,
    handleGoogleLoginFailure,
    switchTeacher,
    startEditingTeacher,
    cancelEditingTeacher,
    updateTeacher,
    deleteTeacher,
    logout,
    debugLogin
  };
};
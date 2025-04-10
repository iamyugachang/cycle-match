import { useState } from 'react';
import { Teacher, UserInfo, UserResponse } from '../types';
import ApiService from '../services/ApiService';

export const useUserViewModel = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [allTeachers, setAllTeachers] = useState<Teacher[]>([]); // All teachers associated with current user
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    console.log("Google 登入成功:", credentialResponse);
    const token = credentialResponse.credential;
    setLoading(true);
    setError("");
  
    try {
      // Use centralized API service to handle Google login
      const data = await ApiService.googleLogin(token);
      
      // Update user info
      setUserInfo(data.userInfo);
      
      // Set all associated teacher records
      setAllTeachers(data.teachers);
      
      // Set current teacher (first one by default or specified teacher)
      if (data.teacher) {
        setCurrentTeacher(data.teacher);
      } else if (data.teachers.length > 0) {
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
    // Reload page to reset Google Login state
    window.location.reload();
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

  // Debug login (for development/testing)
  const debugLogin = async (googleId: string) => {
    if (!googleId) return null;

    console.log("Debug mode: 模擬 Google 登入, ID:", googleId);
    
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
    loading,
    error,
    setUserInfo,
    setCurrentTeacher,
    setAllTeachers,
    handleGoogleLoginSuccess,
    handleGoogleLoginFailure,
    switchTeacher,
    logout,
    debugLogin
  };
};
import { useState, useEffect } from 'react';
import { MatchResult, Teacher } from '../types';
import { isUserInvolved, sortMatches, getVisibleMatches } from '../utils/matchUtils';
import ApiService from '../services/ApiService';

export const useMatchViewModel = (currentTeacher: Teacher | null, allTeachers: Teacher[] = []) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [userView, setUserView] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<{id: number | undefined, email: string, isOpen: boolean} | null>(null);
  
  // Check for debug authentication from localStorage
  useEffect(() => {
    const debugAuthenticated = localStorage.getItem('debug_authenticated') === 'true';
    if (debugAuthenticated) {
      setIsDebugMode(true);
    }
  }, []);
  
  // Get current Taiwanese year
  const currentYear = new Date().getFullYear() - 1911;

  // Fetch matches data from API
  const fetchMatches = async () => {
    setLoading(true);
    setError("");
    
    try {
      const matchData = await ApiService.getMatches();
      
      // Filter for current year matches
      const currentYearMatches = matchData.filter((match: MatchResult) => {
        return match.teachers.some(teacher => teacher.year === currentYear);
      });
      
      setMatches(currentYearMatches);
      return currentYearMatches;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "未知錯誤";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new teacher
  const createTeacher = async (teacher: Teacher, googleId: string | undefined) => {
    if (!googleId) {
      throw new Error("Google ID 未設定，請重新登入");
    }

    setLoading(true);
    setError("");
    
    try {
      // Ensure we include google_id and current year
      const teacherWithMetadata = {
        ...teacher,
        google_id: googleId,
        year: currentYear,
      };
  
      const createdTeacher = await ApiService.createTeacher(teacherWithMetadata);
      
      // Fetch updated matches
      await fetchMatches();
      
      return createdTeacher;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "操作失敗，請稍後再試";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get filtered matches based on current mode and user
  const getFilteredMatches = () => {
    // Filter matches for current year
    const yearMatches = matches.filter(match => 
      match.teachers.some(teacher => teacher.year === currentYear)
    );
    
    // If debug mode and all matches view is enabled
    if (isDebugMode && !userView) {
      return yearMatches;
    }
    
    // Normal mode or debug mode with user view: show only matches directly involving the current teacher
    if (!currentTeacher) {
      return [];
    }
    
    // Only show matches involving the current teacher (directly)
    return yearMatches.filter(match => 
      match.teachers.some(teacher => teacher.id === currentTeacher.id)
    );
  };

  // Get sorted matches with current user's matches first
  const getSortedMatches = () => {
    return sortMatches(getFilteredMatches(), currentTeacher);
  };

  // Teacher info display management
  const showTeacherInfo = (id: number | undefined, email: string) => {
    setTeacherInfo({ id, email, isOpen: true });
  };

  const closeTeacherInfo = () => {
    if (teacherInfo) {
      setTeacherInfo({ ...teacherInfo, isOpen: false });
    }
  };

  // Debug mode and user view toggle
  const enableDebugMode = () => {
    setIsDebugMode(true);
    // Default to all matches view when enabling debug mode
    setUserView(false);
  };
  
  const disableDebugMode = () => {
    setIsDebugMode(false);
    setUserView(false);
  };
  
  // Toggle user view in debug mode
  const toggleUserView = () => {
    if (isDebugMode) {
      setUserView(!userView);
    }
  };

  // Check if in user view mode
  const isUserViewActive = () => {
    return isDebugMode && userView;
  };
  
  // Get title based on current view mode
  const getViewModeTitle = () => {
    if (!isDebugMode) return `${currentYear}年度配對結果`;
    if (userView) return `${currentYear}年度配對結果 (用戶視角)`;
    return `${currentYear}年度配對結果 (Debug 模式)`;
  };

  return {
    matches,
    loading,
    error,
    isDebugMode,
    userView,
    teacherInfo,
    currentYear,
    fetchMatches,
    createTeacher,
    getFilteredMatches,
    getSortedMatches,
    showTeacherInfo,
    closeTeacherInfo,
    enableDebugMode,
    disableDebugMode,
    toggleUserView,
    isUserViewActive,
    getViewModeTitle
  };
};
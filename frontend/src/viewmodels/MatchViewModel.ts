import { useState } from 'react';
import { MatchResult, Teacher } from '../types';
import { isUserInvolved, sortMatches, getVisibleMatches } from '../utils/matchUtils';

export const useMatchViewModel = (currentTeacher: Teacher | null, allTeachers: Teacher[] = []) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [userView, setUserView] = useState(false); // 用於在 debug 模式下模擬使用者視角
  const [teacherInfo, setTeacherInfo] = useState<{id: number | undefined, email: string} | null>(null);
  
  // 取得當前民國年度
  const currentYear = new Date().getFullYear() - 1911;

  // Fetch matches data from API
  const fetchMatches = async () => {
    setLoading(true);
    setError("");
    
    try {
      const matchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/matches`
      );
      
      if (!matchResponse.ok) {
        throw new Error(`配對結果獲取失敗: ${matchResponse.status}`);
      }

      const matchData = await matchResponse.json();
      
      // 篩選出當前年度的配對結果
      const currentYearMatches = matchData.filter((match: MatchResult) => {
        // 只要配對中有一位老師是當前年度的，就顯示此配對
        return match.teachers.some(teacher => teacher.year === currentYear);
      });
      
      setMatches(currentYearMatches);
      return currentYearMatches;
    } catch (err) {
      console.error("資料獲取錯誤:", err);
      setError(err instanceof Error ? err.message : "未知錯誤");
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
      // 確保將 `google_id` 包含在發送的資料中
      const teacherWithGoogleId = {
        ...teacher,
        google_id: googleId,
        year: currentYear, // 確保設定當前年度
      };
  
      console.log("發送到後端的資料:", JSON.stringify(teacherWithGoogleId, null, 2));
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teacherWithGoogleId),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API 錯誤回應:", response.status, errorText);
        throw new Error(`後端錯誤: ${response.status} ${response.statusText} - ${errorText}`);
      }
  
      // 儲存創建的教師資料
      const createdTeacher = await response.json();
      console.log("從後端收到的回應:", createdTeacher);
      
      // 獲取配對結果
      await fetchMatches();
      
      return createdTeacher;
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗，請稍後再試");
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 獲取與用戶所有教師相關的配對
  const getFilteredMatches = () => {
    // 先過濾出當前年度的配對
    const yearMatches = matches.filter(match => 
      match.teachers.some(teacher => teacher.year === currentYear)
    );
    
    // 如果是 debug 模式但啟用了用戶視角，只顯示與當前選擇的教師相關的配對
    if (isDebugMode && userView) {
      return getVisibleMatches(yearMatches, false, currentTeacher);
    }
    
    // Debug 模式顯示所有配對
    if (isDebugMode) {
      return yearMatches;
    }
    
    // 正常模式：顯示與用戶所有教師相關的配對
    if (allTeachers.length === 0) {
      return [];
    }
    
    // 過濾出與用戶任何一個教師相關的配對
    return yearMatches.filter(match => 
      allTeachers.some(teacher => isUserInvolved(match, teacher))
    );
  };

  // Get sorted matches with current user's matches first
  const getSortedMatches = () => {
    return sortMatches(getFilteredMatches(), currentTeacher);
  };

  // Teacher info display management
  const showTeacherInfo = (id: number | undefined, email: string) => {
    setTeacherInfo({ id, email });
  };

  const closeTeacherInfo = () => {
    setTeacherInfo(null);
  };

  // Debug 模式與用戶視角切換
  const enableDebugMode = () => {
    setIsDebugMode(true);
    setUserView(false);
  };
  
  const disableDebugMode = () => {
    setIsDebugMode(false);
    setUserView(false);
  };
  
  // 在 debug 模式下切換到用戶視角
  const toggleUserView = () => {
    if (isDebugMode) {
      setUserView(!userView);
    }
  };

  // 檢查是否在 debug 模式下使用用戶視角
  const isUserViewActive = () => isDebugMode && userView;
  
  // 獲取顯示模式的標題
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
    getViewModeTitle,
    setIsDebugMode
  };
};
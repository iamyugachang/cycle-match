import { useState } from 'react';
import { MatchResult, Teacher } from '../types';
import { getMatchTypeName, isUserInvolved, sortMatches, getVisibleMatches } from '../utils/matchUtils';

export const useMatchViewModel = (currentTeacher: Teacher | null) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [teacherInfo, setTeacherInfo] = useState<{id: number | undefined, email: string} | null>(null);

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
      setMatches(matchData);
      return matchData;
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

  // Get visible matches based on current mode
  const getFilteredMatches = () => {
    return getVisibleMatches(matches, isDebugMode, currentTeacher);
  };

  // Get sorted matches with current user's matches first
  const getSortedMatches = () => {
    return sortMatches(matches, currentTeacher);
  }; 

  // Teacher info display management
  const showTeacherInfo = (id: number | undefined, email: string) => {
    setTeacherInfo({ id, email });
  };

  const closeTeacherInfo = () => {
    setTeacherInfo(null);
  };

  // Debug mode functions
  const enableDebugMode = () => {
    setIsDebugMode(true);
  };
  
  const disableDebugMode = () => {
    setIsDebugMode(false);
  };

  return {
    matches,
    loading,
    error,
    isDebugMode,
    teacherInfo,
    fetchMatches,
    createTeacher,
    getFilteredMatches,
    getSortedMatches,
    showTeacherInfo,
    closeTeacherInfo,
    enableDebugMode,
    disableDebugMode,
    setIsDebugMode
  };
};
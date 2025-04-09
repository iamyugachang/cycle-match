import { useState, useEffect } from 'react';
import { Teacher, UserInfo } from '../types';

export const useUserViewModel = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    console.log("Google 登入成功:", credentialResponse);
    const token = credentialResponse.credential;
    setLoading(true);
    setError("");
  
    try {
      // 將 Google Token 傳送到後端進行驗證
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error(`Google 登入驗證失敗: ${response.status}`);
      }

      const data = await response.json();
      console.log("後端驗證成功:", data);

      // 設定使用者資訊
      setUserInfo({
        name: data.name || "未知使用者",
        picture: data.picture || "",
        email: data.email || "",
        google_id: data.google_id || "",
      });

      // 如果後端返回教師資訊，設定當前教師
      if (data.teacher) {
        setCurrentTeacher(data.teacher);
      }

      return {
        userInfo: {
          name: data.name || "未知使用者",
          picture: data.picture || "",
          email: data.email || "",
          google_id: data.google_id || "",
        },
        teacher: data.teacher
      };
    } catch (err) {
      console.error("後端驗證失敗:", err);
      setError(err instanceof Error ? err.message : "Google 登入驗證失敗，請稍後再試");
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
    // 重新載入頁面以重設 Google Login
    window.location.reload();
  };

  // 模擬登入（用於 DEBUG 模式）
  const debugLogin = async (googleId: string) => {
    if (!googleId) return;

    console.log("Debug mode: 模擬 Google 登入, ID:", googleId);
    
    const mockUserInfo = {
      name: "Debug User",
      picture: "", // Empty string for no avatar
      email: googleId,
      google_id: googleId,
    };
    
    setUserInfo(mockUserInfo);
    setLoading(true);

    try {
      // 嘗試獲取此 Google ID 的教師資料
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/teachers?google_id=${encodeURIComponent(googleId)}`,
        { method: "GET" }
      );
      
      if (response.ok) {
        const teachers = await response.json();
        console.log("Debug mode: 獲取的教師資料:", teachers);
        
        if (teachers && teachers.length > 0) {
          // 找到教師資料，設置為當前教師
          setCurrentTeacher(teachers[0]);
          return { userInfo: mockUserInfo, teacher: teachers[0] };
        }
      }
      
      // 無教師資料或獲取失敗
      return { userInfo: mockUserInfo, teacher: null };
    } catch (err) {
      console.error("Debug mode: 獲取教師資料失敗:", err);
      setError("獲取教師資料失敗，請稍後再試");
      return { userInfo: mockUserInfo, teacher: null };
    } finally {
      setLoading(false);
    }
  };

  return {
    userInfo,
    currentTeacher,
    loading,
    error,
    setUserInfo,
    setCurrentTeacher,
    handleGoogleLoginSuccess,
    handleGoogleLoginFailure,
    logout,
    debugLogin
  };
};
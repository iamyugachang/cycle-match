"use client";

import { useState, useEffect, useRef } from "react";
import TeacherForm from "../components/TeacherForm";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

interface Teacher {
  id?: number;
  name?: string;
  display_id?: string;
  email: string;
  year: number;
  current_county: string;
  current_district: string;
  current_school: string;
  target_counties: string[];
  target_districts: string[];
}

interface MatchResult {
  match_type: string;
  teachers: Teacher[];
}

export default function Home() {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [teacherInfo, setTeacherInfo] = useState<{id: number | undefined, email: string} | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; picture: string } | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // State for Debug Mode dropdown
  const [showDebugDropdown, setShowDebugDropdown] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  
  // Ref for tracking clicks outside dropdown menus
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const debugDropdownRef = useRef<HTMLDivElement>(null);
  
  // Update state management for hovers instead of clicks
  const [userDropdownHover, setUserDropdownHover] = useState(false);
  const [debugDropdownHover, setDebugDropdownHover] = useState(false);

  // Handle clicks outside of dropdown menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close user dropdown if clicked outside
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      
      // Close debug dropdown if clicked outside
      if (debugDropdownRef.current && !debugDropdownRef.current.contains(event.target as Node)) {
        setShowDebugDropdown(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGoogleLoginSuccess = (credentialResponse: any) => {
    console.log("Google 登入成功:", credentialResponse);
    const token = credentialResponse.credential;
  
    // 將 Google Token 傳送到後端進行驗證
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("後端驗證成功:", data);

        // 設定使用者資訊
        setUserInfo({
          name: data.name || "未知使用者",
          picture: data.picture || "",
          email: data.email || "",
          google_id: data.google_id || "",
        });

        // 根據後端返回的教師資訊決定顯示內容
        if (data.teacher) {
          setCurrentTeacher(data.teacher);
          fetchData(); // 如果已登記，載入配對結果
        } else {
          setShowForm(true); // 如果未登記，顯示表單
          setShowResults(false);
        }
      })
      .catch((err) => {
        console.error("後端驗證失敗:", err);
        setError("Google 登入驗證失敗，請稍後再試");
      });
  };

  // Google 登入失敗處理
  const handleGoogleLoginFailure = (error: any) => {
    console.error("Google 登入失敗:", error);
    setError("Google 登入失敗，請稍後再試");
  };
  
  // 獲取教師數據和配對結果的函數
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 獲取配對結果，無需依賴 google_id
      const matchResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/matches`
      );
      if (!matchResponse.ok) {
        throw new Error(`配對結果獲取失敗: ${matchResponse.status}`);
      }

      const matchData = await matchResponse.json();
      setMatches(matchData);

      // 顯示結果
      setShowResults(true);
      setShowForm(false);
    } catch (err) {
      console.error("資料獲取錯誤:", err);
      setError(err instanceof Error ? err.message : "未知錯誤");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (teacher: Teacher) => {
    setLoading(true);
    setError("");
    try {
      if (!userInfo?.google_id) {
        throw new Error("Google ID 未設定，請重新登入");
      }
  
      // 確保將 `google_id` 包含在發送的資料中
      const teacherWithGoogleId = {
        ...teacher,
        google_id: userInfo.google_id, // 使用 Google ID
      };
  
      console.log("發送到後端的資料:", JSON.stringify(teacherWithGoogleId, null, 2));
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teacherWithGoogleId), // 傳遞包含 google_id 的資料
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API 錯誤回應:", response.status, errorText);
        throw new Error(`後端錯誤: ${response.status} ${response.statusText} - ${errorText}`);
      }
  
      // 儲存創建的教師資料
      const createdTeacher = await response.json();
      console.log("從後端收到的回應:", createdTeacher);
      setCurrentTeacher(createdTeacher);
  
      // 獲取配對結果
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗，請稍後再試");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setShowForm(true);
  };

  // Only modify the debug mode viewer function to not require login
  const handleViewAllMatches = () => {
    setIsDebugMode(true);
    fetchData();
    setShowDebugDropdown(false);
    
    // If user is not logged in, create a minimal debug session
    if (!userInfo) {
      setUserInfo({
        name: "Debug Viewer",
        picture: "",  // Empty string for no avatar
        email: "debug@example.com",
        google_id: "debug@example.com",
      });
    }
  };

  // Updated debug login function to use placeholder image
  const handleDebugMode = () => {
    // 彈出對話框讓使用者輸入 Google ID (email)
    const googleId = prompt("請輸入模擬的 Google ID (email):", "test@example.com");
    
    if (googleId) {
      // 模擬 Google 登入成功
      console.log("Debug mode: 模擬 Google 登入, ID:", googleId);
      
      setUserInfo({
        name: "Debug User",
        picture: "", // Empty string for no avatar
        email: googleId,
        google_id: googleId,
      });

      // 嘗試獲取詆 Google ID 的教師資料
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers?google_id=${encodeURIComponent(googleId)}`, {
        method: "GET",
      })
        .then((res) => res.ok ? res.json() : [])
        .then((teachers) => {
          console.log("Debug mode: 獲取的教師資料:", teachers);
          
          if (teachers && teachers.length > 0) {
            // 找到教師資料，設置為當前教師
            setCurrentTeacher(teachers[0]);
            fetchData(); // 獲取配對結果
          } else {
            // 無教師資料，顯示表單
            setShowForm(true);
            setShowResults(false);
          }
        })
        .catch((err) => {
          console.error("Debug mode: 獲取教師資料失敗:", err);
          setError("獲取教師資料失敗，請稍後再試");
          setShowForm(true);
          setShowResults(false);
        });
    }
  };

  // 檢查當前教師是否參與了特定配對
  const isUserInvolved = (match: MatchResult): boolean => {
    if (!currentTeacher?.id) return false;
    return match.teachers.some(teacher => teacher.id === currentTeacher.id);
  };

  // 處理顯示教師資訊的函數
  const showTeacherInfo = (id: number | undefined, email: string) => {
    setTeacherInfo({ id, email });
  };

  // 關閉教師資訊的函數
  const closeTeacherInfo = () => {
    setTeacherInfo(null);
  };

  // 獲取易讀的配對類型名稱
  const getMatchTypeName = (type: string): string => {
    if (type === "direct_swap") return "直接互調";
    if (type === "triangle_swap") return "三角調";
    if (type.includes("_swap")) {
      const num = type.split("_")[0];
      return `${num}角調`;
    }
    return type;
  };

  // Show all matches only in debug mode, otherwise filter by current user
  const getVisibleMatches = () => {
    if (isDebugMode) {
      return matches;
    } else if (currentTeacher) {
      return matches.filter(match => 
        match.teachers.some(teacher => teacher.id === currentTeacher.id)
      );
    }
    return [];
  };

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
        {/* Debug Mode 按鈕 - 左上角 */}
        <div 
          style={{ 
            position: "absolute", 
            top: "10px", 
            left: "10px",
          }}
          ref={debugDropdownRef}
          onMouseEnter={() => setDebugDropdownHover(true)}
          onMouseLeave={() => setDebugDropdownHover(false)}
        >
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch"
          }}>
            <button 
              style={{ 
                padding: "6px 12px",
                backgroundColor: debugDropdownHover ? "#5a6268" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: debugDropdownHover ? "4px 4px 0 0" : "4px",
                cursor: "pointer",
                fontSize: "12px",
                transition: "all 0.2s ease-in-out",
                transform: debugDropdownHover ? "translateY(-2px)" : "translateY(0)",
                boxShadow: debugDropdownHover ? "0 2px 5px rgba(0,0,0,0.2)" : "none",
                marginBottom: 0
              }}
            >
              DEBUG MODE
            </button>
            
            {debugDropdownHover && (
              <div
                style={{
                  backgroundColor: "white",
                  border: "1px solid #ddd",
                  borderTop: "none",
                  borderRadius: "0 0 5px 5px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                  minWidth: "180px",
                }}
              >
                <button
                  onClick={handleViewAllMatches}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    textAlign: "left",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  顯示所有配對結果
                </button>
                <button
                  onClick={handleDebugMode}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px",
                    textAlign: "left",
                    border: "none",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  模擬新使用者登入
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 用戶資訊 - 只在登入後顯示於右上角 */}
        {userInfo && (
          <div 
            style={{ position: "absolute", top: "10px", right: "10px" }}
            ref={userDropdownRef}
            onMouseEnter={() => setUserDropdownHover(true)}
            onMouseLeave={() => setUserDropdownHover(false)}
          >
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "stretch"
            }}>
              <div
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "10px", 
                  cursor: "pointer",
                  padding: "4px 8px",
                  borderRadius: userDropdownHover ? "4px 4px 0 0" : "4px",
                  backgroundColor: userDropdownHover ? "#f8f9fa" : "transparent",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {userInfo.picture ? (
                  <img
                    src={userInfo.picture}
                    alt="User Avatar"
                    style={{ 
                      width: "40px", 
                      height: "40px", 
                      borderRadius: "50%",
                      border: "2px solid transparent",
                      transition: "border-color 0.2s ease"
                    }}
                  />
                ) : (
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    backgroundColor: "#007bff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "16px"
                  }}>
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{userInfo.name}</span>
              </div>
              
              {userDropdownHover && (
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #ddd",
                    borderTop: "none",
                    borderRadius: "0 0 4px 4px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                    minWidth: "180px",
                  }}
                >
                  <button
                    onClick={() => {
                      setShowResults(true);
                      setShowForm(false);
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px",
                      textAlign: "left",
                      border: "none",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    顯示我的配對結果
                  </button>
                  <button
                    onClick={() => {
                      setUserInfo(null);
                      setCurrentTeacher(null);
                      window.location.reload(); // Reload the page to reset Google Login
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px",
                      textAlign: "left",
                      border: "none", 
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#f0f0f0"; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                  >
                    登出
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <h1 style={{ textAlign: "center", marginBottom: "20px", marginTop: "40px" }}>CircleMatch - 教師介聘配對系統</h1>

        {/* 未登入時顯示介紹頁面 */}
        {!userInfo ? (
          <div style={{ 
            padding: "30px", 
            border: "1px solid #ddd", 
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            maxWidth: "700px",
            margin: "0 auto 30px",
            backgroundColor: "#fff"
          }}>
            <h2 style={{ marginBottom: "20px", color: "#2c3e50" }}>歡迎使用教師介聘配對系統</h2>
            
            <p style={{ fontSize: "16px", lineHeight: "1.6", marginBottom: "15px" }}>
              CircleMatch 是一個幫助教師找到互調機會的平台。透過多角調配對演算法，
              我們能夠找出兩人互調、三角調甚至更複雜的調動組合，大幅增加您成功介聘的機會。
            </p>
            
            <h3 style={{ margin: "25px 0 15px", color: "#2c3e50" }}>使用指南</h3>
            <ol style={{ paddingLeft: "20px", fontSize: "16px", lineHeight: "1.6" }}>
              <li style={{ marginBottom: "10px" }}>使用 Google 帳號登入系統</li>
              <li style={{ marginBottom: "10px" }}>填寫您的現職學校及想調往的地區</li>
              <li style={{ marginBottom: "10px" }}>系統會自動尋找可能的配對組合</li>
              <li style={{ marginBottom: "10px" }}>配對成功後，您可以查看對方的聯絡資訊</li>
            </ol>
            
            <h3 style={{ margin: "25px 0 15px", color: "#2c3e50" }}>開始使用</h3>
            <p style={{ fontSize: "16px", marginBottom: "25px" }}>
              請使用 Google 帳號登入，開始您的介聘之旅！
            </p>
            
            <div style={{ textAlign: "center", margin: "30px 0 10px" }}>
              <div style={{ display: "inline-block" }}>
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginFailure}
                />
              </div>
            </div>
          </div>
        ) : (
          /* 已登入且選擇填表單 */
          showForm && (
            <div style={{ 
              padding: "20px", 
              border: "1px solid #ddd", 
              borderRadius: "5px" 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h2 style={{ margin: 0 }}>登記介聘資料</h2>
              </div>
              
              <TeacherForm onSubmit={handleCreateTeacher} defaultEmail={userInfo.email} />
              {loading && <p style={{ textAlign: "center", marginTop: "10px" }}>處理中...</p>}
              {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}
            </div>
          )
        )}

        {/* 配對結果頁面 - 只有在登入後且顯示結果時呈現 */}
        {userInfo && showResults && (
          <div style={{ 
            padding: "20px", 
            border: "1px solid #ddd", 
            borderRadius: "5px" 
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2>配對結果</h2>
              <button 
                onClick={handleBackToForm}
                style={{ 
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                返回表單
              </button>
            </div>
            
            {loading ? (
              <p style={{ textAlign: "center" }}>載入中...</p>
            ) : matches.length === 0 ? (
              <p style={{ textAlign: "center", padding: "20px 0" }}>
                尚未找到符合條件的配對結果。{currentTeacher ? "您的資料已登記，當有符合條件的教師登記時，系統將自動配對。" : ""}
              </p>
            ) : (
              <div>
                {/* 使用者參與的配對 */}
                {currentTeacher && sortedMatches().some(isUserInvolved) && (
                  <div style={{ marginBottom: "30px" }}>
                    <h3 style={{ borderBottom: "2px solid #007bff", paddingBottom: "5px", marginBottom: "15px" }}>
                      您的配對
                    </h3>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                      {sortedMatches().filter(isUserInvolved).map((match, index) => (
                        <li key={`user-${index}`} style={{ 
                          marginBottom: "15px", 
                          padding: "15px", 
                          border: "1px solid #007bff",
                          borderRadius: "5px",
                          backgroundColor: "#f0f7ff" 
                        }}>
                          <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.1rem" }}>
                            {getMatchTypeName(match.match_type)} ({match.teachers.length} 人)
                          </div>

                          <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ backgroundColor: "#e6f2ff" }}>
                                <th style={{ padding: "8px", textAlign: "left", border: "1px solid #cce5ff" }}>教師</th>
                                <th style={{ padding: "8px", textAlign: "left", border: "1px solid #cce5ff" }}>現任學校</th>
                                <th style={{ padding: "8px", textAlign: "left", border: "1px solid #cce5ff" }}>調往學校</th>
                                <th style={{ padding: "8px", textAlign: "center", border: "1px solid #cce5ff", width: "40px" }}>資訊</th>
                              </tr>
                            </thead>
                            <tbody>
                              {match.teachers.map((teacher, idx) => {
                                const nextTeacher = match.teachers[(idx + 1) % match.teachers.length];
                                const isCurrentUser = teacher.id === currentTeacher?.id;
                                
                                return (
                                  <tr key={idx} style={{ 
                                    backgroundColor: isCurrentUser ? "#e6f2ff" : "transparent" 
                                  }}>
                                    <td style={{ 
                                      padding: "8px", 
                                      border: "1px solid #cce5ff",
                                      fontWeight: isCurrentUser ? "bold" : "normal"
                                    }}>
                                      {teacher.display_id || `${teacher.current_county}${teacher.current_district}#${teacher.id}`}
                                    </td>
                                    <td style={{ padding: "8px", border: "1px solid #cce5ff" }}>
                                      {teacher.current_county} {teacher.current_district} {teacher.current_school}
                                    </td>
                                    <td style={{ padding: "8px", border: "1px solid #cce5ff" }}>
                                      {nextTeacher.current_county} {nextTeacher.current_district} {nextTeacher.current_school}
                                    </td>
                                    <td style={{ padding: "8px", textAlign: "center", border: "1px solid #cce5ff" }}>
                                      <button 
                                        onClick={() => showTeacherInfo(teacher.id, teacher.email)}
                                        style={{ 
                                          backgroundColor: "#007bff", 
                                          color: "white", 
                                          border: "none", 
                                          borderRadius: "50%",
                                          width: "24px", 
                                          height: "24px",
                                          cursor: "pointer",
                                          fontSize: "12px",
                                          padding: 0,
                                          display: "inline-flex",
                                          alignItems: "center",
                                          justifyContent: "center"
                                        }}
                                      >
                                        i
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* 所有配對 */}
                <div>
                  <h3 style={{ borderBottom: "2px solid #6c757d", paddingBottom: "5px", marginBottom: "15px" }}>
                    {isDebugMode ? "所有可能的配對 (Debug 模式)" : "所有可能的配對"}
                  </h3>
                  <ul style={{ listStyle: "none", padding: 0 }}>
                    {getVisibleMatches().map((match, index) => (
                      <li key={index} style={{ 
                        marginBottom: "15px", 
                        padding: "15px", 
                        border: "1px solid #dee2e6",
                        borderRadius: "5px",
                        backgroundColor: currentTeacher && isUserInvolved(match) ? "#f0f7ff" : "white" 
                      }}>
                        <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.1rem" }}>
                          {getMatchTypeName(match.match_type)} ({match.teachers.length} 人)
                        </div>

                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ backgroundColor: "#f5f5f5" }}>
                              <th style={{ padding: "8px", textAlign: "left", border: "1px solid #dee2e6" }}>教師</th>
                              <th style={{ padding: "8px", textAlign: "left", border: "1px solid #dee2e6" }}>現任學校</th>
                              <th style={{ padding: "8px", textAlign: "left", border: "1px solid #dee2e6" }}>調往學校</th>
                              <th style={{ padding: "8px", textAlign: "center", border: "1px solid #dee2e6", width: "40px" }}>資訊</th>
                            </tr>
                          </thead>
                          <tbody>
                            {match.teachers.map((teacher, idx) => {
                              const nextTeacher = match.teachers[(idx + 1) % match.teachers.length];
                              const isCurrentUser = currentTeacher && teacher.id === currentTeacher.id;
                              
                              return (
                                <tr key={idx} style={{ 
                                  backgroundColor: isCurrentUser ? "#e6f2ff" : "transparent" 
                                }}>
                                  <td style={{ 
                                    padding: "8px", 
                                    border: "1px solid #dee2e6",
                                    fontWeight: isCurrentUser ? "bold" : "normal"
                                  }}>
                                    {teacher.display_id || `${teacher.current_county}${teacher.current_district}#${teacher.id}`}
                                  </td>
                                  <td style={{ padding: "8px", border: "1px solid #dee2e6" }}>
                                    {teacher.current_county} {teacher.current_district} {teacher.current_school}
                                  </td>
                                  <td style={{ padding: "8px", border: "1px solid #dee2e6" }}>
                                    {nextTeacher.current_county} {nextTeacher.current_district} {nextTeacher.current_school}
                                  </td>
                                  <td style={{ padding: "8px", textAlign: "center", border: "1px solid #dee2e6" }}>
                                    <button 
                                      onClick={() => showTeacherInfo(teacher.id, teacher.email)}
                                      style={{ 
                                        backgroundColor: "#6c757d", 
                                        color: "white", 
                                        border: "none", 
                                        borderRadius: "50%",
                                        width: "24px", 
                                        height: "24px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        padding: 0,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                      }}
                                    >
                                      i
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* 教師資訊彈窗 */}
        {teacherInfo && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "5px",
              maxWidth: "400px",
              width: "100%"
            }}>
              <h3 style={{ marginTop: 0 }}>教師聯絡資訊</h3>
              <p><strong>代號:</strong> {teacherInfo.id ? `${matches.flatMap(m => m.teachers).find(t => t.id === teacherInfo.id)?.display_id || '未知'}` : '未知'}</p>
              <p><strong>Email:</strong> {teacherInfo.email}</p>
              <button 
                onClick={closeTeacherInfo}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "10px"
                }}
              >
                關閉
              </button>
            </div>
          </div>
        )}
      </main>
    </GoogleOAuthProvider>
  );
  
  // 按照當前使用者參與的配對優先排序
  function sortedMatches(): MatchResult[] {
    if (!currentTeacher) return matches;
    
    // 複製陣列以避免修改原始資料
    const sorted = [...matches];
    // 根據當前使用者是否參與配對排序
    sorted.sort((a, b) => {
      const aInvolved = isUserInvolved(a);
      const bInvolved = isUserInvolved(b);
      if (aInvolved && !bInvolved) return -1;
      if (!aInvolved && bInvolved) return 1;
      return 0;
    });
    return sorted;
  }
}
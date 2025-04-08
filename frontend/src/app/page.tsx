"use client";

import { useState, useEffect } from "react";
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
        });
  
        // 根據需要處理登入後的邏輯，例如設定當前使用者
        setCurrentTeacher(data.teacher);
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
      // 獲取配對結果
      const matchResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/matches`);
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
      console.log("發送到後端的資料:", JSON.stringify(teacher, null, 2));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(teacher),
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

  const handleDebugMode = () => {
    fetchData();
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

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <main style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>CircleMatch - 教師介聘配對系統</h1>

        {/* Google 登入按鈕 */}
        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
        {userInfo ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img
              src={userInfo.picture}
              alt="User Avatar"
              style={{ width: "40px", height: "40px", borderRadius: "50%" }}
            />
            <span>{userInfo.name}</span>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginFailure}
          />
        )}
      </div>

      {!showResults && showForm ? (
        <div style={{ 
          padding: "20px", 
          border: "1px solid #ddd", 
          borderRadius: "5px" 
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h2 style={{ margin: 0 }}>登記介聘資料</h2>
            
            <button 
              onClick={handleDebugMode}
              style={{ 
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              DEBUG MODE
            </button>
          </div>
          
          <TeacherForm onSubmit={handleCreateTeacher} />
          {loading && <p style={{ textAlign: "center", marginTop: "10px" }}>處理中...</p>}
          {error && <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>{error}</p>}
        </div>
      ) : (
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
                  所有可能的配對
                </h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  {sortedMatches().map((match, index) => (
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
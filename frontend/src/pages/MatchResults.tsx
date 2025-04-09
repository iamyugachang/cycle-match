import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MatchCard from "../components/MatchCard";
import { MatchResult } from "../types";
import { useAuth } from "../contexts/AuthContext";
import { isUserInvolved } from "../utils/matchUtils";

const MatchResults: React.FC = () => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDebugMode, setIsDebugMode] = useState(false);
  const { currentUser, teacher } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/matches", {
          headers: {
            Authorization: `Bearer ${await currentUser.getIdToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch matches");
        }
        
        const data = await response.json();
        setMatches(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setLoading(false);
      }
    };
    
    fetchMatches();
  }, [currentUser, navigate]);
  
  // 根據是否為 debug mode 過濾顯示的配對
  const userMatches = matches.filter(match => teacher && isUserInvolved(match, teacher));
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">配對結果</h1>
      
      {loading ? (
        <div className="text-center py-8">載入中...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <>
          {/* 用戶的配對 */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">您的配對</h2>
            {userMatches.length > 0 ? (
              userMatches.map(match => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  currentTeacher={teacher} 
                  showDetailedView={true}
                />
              ))
            ) : (
              <div className="text-gray-500">目前沒有與您相關的配對</div>
            )}
          </div>
          
          {isDebugMode ? (
            <>
              {/* Debug 模式切換開關 */}
              <div className="mt-6 mb-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => setIsDebugMode(false)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-blue-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">關閉所有可能配對顯示</span>
                </label>
              </div>
              
              {/* 只在 debug 模式下顯示所有配對 */}
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-4">所有可能的配對</h2>
                {matches.length > 0 ? (
                  matches.map(match => (
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      currentTeacher={teacher} 
                      showDetailedView={true}
                    />
                  ))
                ) : (
                  <div className="text-gray-500">目前沒有任何配對</div>
                )}
              </div>
            </>
          ) : (
            /* 非 debug 模式下的 debug 開關 */
            <div className="mt-6 mb-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => setIsDebugMode(true)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">顯示所有可能配對</span>
              </label>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MatchResults;
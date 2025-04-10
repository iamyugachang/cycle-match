import React from "react";
import { MatchResult, Teacher } from "../types";
import { getMatchTypeName, isUserInvolved } from "../utils/matchUtils";

interface MatchCardProps {
  match: MatchResult;
  currentTeacher: Teacher | null;
  showDetailedView?: boolean; // 新增參數，用於控制是否顯示詳細視圖
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  currentTeacher, 
  showDetailedView = false 
}) => {
  const isInvolved = isUserInvolved(match, currentTeacher);
  
  return (
    <div
      className={`rounded-lg border p-4 mb-4 ${
        isInvolved ? "border-blue-500 bg-blue-50" : "border-gray-300"
      }`}
      style={{
        borderRadius: "0.5rem",
        border: isInvolved ? "1px solid #3b82f6" : "1px solid #d1d5db", 
        padding: "1rem",
        marginBottom: "1rem",
        backgroundColor: isInvolved ? "#eff6ff" : "white"
      }}
    >
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center" 
      }}>
        <div style={{ 
          flex: "0 0 33%", 
          textAlign: "center" 
        }}>
          <div style={{ 
            fontWeight: "bold" 
          }}>
            {getMatchTypeName(match)}
          </div>
          {isInvolved && (
            <div style={{ 
              fontSize: "0.875rem", 
              color: "#2563eb", 
              marginTop: "0.25rem" 
            }}>
              您參與的配對
            </div>
          )}
        </div>
        
        <div style={{ flex: "0 0 67%" }}>
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            justifyContent: "flex-end" 
          }}>
            {match.teachers.map((teacher, index) => (
              <div
                key={teacher.id}
                style={{
                  padding: "0.25rem 0.5rem",
                  margin: "0.25rem",
                  borderRadius: "9999px",
                  fontSize: "0.875rem",
                  backgroundColor: teacher.id === currentTeacher?.id ? "#3b82f6" : "#f3f4f6",
                  color: teacher.id === currentTeacher?.id ? "white" : "#4b5563"
                }}
              >
                {teacher.name || teacher.email}
                {index < match.teachers.length - 1 && " →"}
              </div>
            ))}
          </div>
          
          {showDetailedView && match.createdAt && (
            <div style={{ 
              fontSize: "0.75rem", 
              color: "#6b7280", 
              marginTop: "0.5rem", 
              textAlign: "right" 
            }}>
              建立於: {new Date(match.createdAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
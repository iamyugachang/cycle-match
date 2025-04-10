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
    <div className={`match-card ${isInvolved ? 'highlighted' : ''}`}>
      <div className="match-card-container">
        <div className="match-type-column">
          <div className="match-type-title">
            {getMatchTypeName(match)}
          </div>
          {isInvolved && (
            <div className="match-involvement-tag">
              您參與的配對
            </div>
          )}
        </div>
        
        <div className="match-teachers-column">
          <div className="teachers-list">
            {match.teachers.map((teacher, index) => (
              <div
                key={teacher.id}
                className={`teacher-tag ${teacher.id === currentTeacher?.id ? 'current-teacher' : ''}`}
              >
                {teacher.name || teacher.email}
                {index < match.teachers.length - 1 && " →"}
              </div>
            ))}
          </div>
          
          {showDetailedView && match.createdAt && (
            <div className="match-creation-time">
              建立於: {new Date(match.createdAt).toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
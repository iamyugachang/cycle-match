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
    >
      <div className="flex justify-between items-center">
        <div className="basis-1/3 text-center">
          <div className="font-bold">
            {getMatchTypeName(match)}
          </div>
          {isInvolved && <div className="text-sm text-blue-600 mt-1">您參與的配對</div>}
        </div>
        
        <div className="basis-2/3">
          <div className="flex flex-wrap justify-end">
            {match.teachers.map((teacher, index) => (
              <div
                key={teacher.id}
                className={`px-2 py-1 m-1 rounded-full text-sm ${
                  teacher.id === currentTeacher?.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {teacher.name || teacher.email}
                {index < match.teachers.length - 1 && " →"}
              </div>
            ))}
          </div>
          
          {showDetailedView && (
            <div className="text-xs text-gray-500 mt-2 text-right">
              {match.createdAt && `建立於: ${new Date(match.createdAt).toLocaleString()}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
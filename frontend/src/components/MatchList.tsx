import { MatchResult, Teacher } from "../types";
import { getMatchTypeName, isUserInvolved } from "../utils/matchUtils";

interface MatchListProps {
  matches: MatchResult[];
  currentTeacher: Teacher | null;
  onShowTeacherInfo: (id: number | undefined, email: string) => void;
  onBackToForm: () => void;
  title?: string;
  isDebugMode?: boolean;
}

const MatchList: React.FC<MatchListProps> = ({
  matches,
  currentTeacher,
  onShowTeacherInfo,
  onBackToForm,
  title = "配對結果",
  isDebugMode = false
}) => {
  if (matches.length === 0) {
    return (
      <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "5px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>{title}</h2>
          <button 
            onClick={onBackToForm}
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
        <p style={{ textAlign: "center", padding: "20px 0" }}>
          尚未找到符合條件的配對結果。{currentTeacher ? "您的資料已登記，當有符合條件的教師登記時，系統將自動配對。" : ""}
        </p>
      </div>
    );
  }

  const matchesSorted = currentTeacher ? 
    [...matches].sort((a, b) => {
      const aInvolved = isUserInvolved(a, currentTeacher);
      const bInvolved = isUserInvolved(b, currentTeacher);
      if (aInvolved && !bInvolved) return -1;
      if (!aInvolved && bInvolved) return 1;
      return 0;
    }) : matches;

  // Find user's matches
  const userMatches = currentTeacher ? 
    matchesSorted.filter(match => isUserInvolved(match, currentTeacher)) : 
    [];

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "5px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>{title}</h2>
        <button 
          onClick={onBackToForm}
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

      {/* 使用者參與的配對 */}
      {currentTeacher && userMatches.length > 0 && (
        <div style={{ marginBottom: "30px" }}>
          <h3 style={{ borderBottom: "2px solid #007bff", paddingBottom: "5px", marginBottom: "15px" }}>
            您的配對
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {userMatches.map((match, index) => (
              <MatchCard 
                key={`user-${index}`}
                match={match}
                currentTeacher={currentTeacher}
                onShowTeacherInfo={onShowTeacherInfo}
                highlighted={true}
              />
            ))}
          </ul>
        </div>
      )}

      {/* 只在 debug 模式下顯示所有配對 */}
      {isDebugMode && (
        <div>
          <h3 style={{ borderBottom: "2px solid #6c757d", paddingBottom: "5px", marginBottom: "15px" }}>
            所有可能的配對
          </h3>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {matchesSorted.map((match, index) => (
              <MatchCard 
                key={index}
                match={match}
                currentTeacher={currentTeacher}
                onShowTeacherInfo={onShowTeacherInfo}
                highlighted={false}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface MatchCardProps {
  match: MatchResult;
  currentTeacher: Teacher | null;
  onShowTeacherInfo: (id: number | undefined, email: string) => void;
  highlighted: boolean;
}

const MatchCard: React.FC<MatchCardProps> = ({ 
  match, 
  currentTeacher, 
  onShowTeacherInfo,
  highlighted 
}) => {
  const isCurrentUserInvolved = currentTeacher && 
    match.teachers.some(teacher => teacher.id === currentTeacher.id);
  
  console.log("Match data before calling getMatchTypeName:", match);

  return (
    <li style={{ 
      marginBottom: "15px", 
      padding: "15px", 
      border: highlighted ? "1px solid #007bff" : "1px solid #dee2e6",
      borderRadius: "5px",
      backgroundColor: isCurrentUserInvolved ? "#f0f7ff" : "white" 
    }}>
      <div style={{ fontWeight: "bold", marginBottom: "10px", fontSize: "1.1rem" }}>
        {getMatchTypeName(match)}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: highlighted ? "#e6f2ff" : "#f5f5f5" }}>
            <th style={{ padding: "8px", textAlign: "left", border: highlighted ? "1px solid #cce5ff" : "1px solid #dee2e6" }}>教師</th>
            <th style={{ padding: "8px", textAlign: "left", border: highlighted ? "1px solid #cce5ff" : "1px solid #dee2e6" }}>現任學校</th>
            <th style={{ padding: "8px", textAlign: "left", border: highlighted ? "1px solid #cce5ff" : "1px solid #dee2e6" }}>調往學校</th>
            <th style={{ padding: "8px", textAlign: "center", border: highlighted ? "1px solid #cce5ff" : "1px solid #dee2e6", width: "40px" }}>資訊</th>
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
                  border: highlighted ? "1px solid #cce5ff" : "1px solid #dee2e6",
                  fontWeight: isCurrentUser ? "bold" : "normal"
                }}>
                  {teacher.display_id || `${teacher.current_county}${teacher.current_district}#${teacher.id}`}
                </td>
                <td style={{ 
                  padding: "8px", 
                  border: highlighted ? "1px solid #cce5ff" : "1px solid #dee2e6"
                }}>
                  {teacher.current_county} {teacher.current_district} {teacher.current_school}
                </td>
                <td style={{ 
                  padding: "8px", 
                  border: highlighted ? "1px solid #cce5ff" : "1px solid #dee2e6" 
                }}>
                  {nextTeacher.current_county} {nextTeacher.current_district} {nextTeacher.current_school}
                </td>
                <td style={{ 
                  padding: "8px", 
                  textAlign: "center", 
                  border: highlighted ? "1px solid #cce5ff" : "1px solid #dee2e6" 
                }}>
                  <button 
                    onClick={() => onShowTeacherInfo(teacher.id, teacher.email)}
                    style={{ 
                      backgroundColor: highlighted ? "#007bff" : "#6c757d", 
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
  );
};

export default MatchList;
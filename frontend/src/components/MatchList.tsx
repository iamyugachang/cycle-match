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

  return (
    <li className={`match-card ${highlighted ? 'highlighted' : ''}`}>
      <div className="match-card-title">
        {getMatchTypeName(match)}
      </div>

      <table className={`match-card-table ${highlighted ? 'highlighted' : ''}`}>
        <thead>
          <tr>
            <th>教師</th>
            <th>現任學校</th>
            <th>目標調往區域</th>
            <th>任教科目</th>
            <th style={{ width: "40px", textAlign: "center" }}>資訊</th>
          </tr>
        </thead>
        <tbody>
          {match.teachers.map((teacher, idx) => {
            const nextTeacher = match.teachers[(idx + 1) % match.teachers.length];
            const isCurrentUser = currentTeacher && teacher.id === currentTeacher.id;
            
            return (
              <tr key={idx} className={isCurrentUser ? 'current-user-row' : ''}>
                <td className={isCurrentUser ? 'current-user-cell' : ''}>
                  {teacher.display_id || `${teacher.current_county}${teacher.current_district}#${teacher.id}`}
                </td>
                <td>
                  {teacher.current_county} • {teacher.current_district} • {teacher.current_school}
                </td>
                <td>
                  {nextTeacher.current_county} • {nextTeacher.current_district}
                </td>
                <td>
                  {teacher.subject || "未指定"}
                </td>
                <td style={{ textAlign: "center" }}>
                  <button 
                    onClick={() => onShowTeacherInfo(teacher.id, teacher.email)}
                    className={`info-button ${highlighted ? 'highlighted' : ''}`}
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

const MatchList: React.FC<MatchListProps> = ({
  matches,
  currentTeacher,
  onShowTeacherInfo,
  onBackToForm,
  title = "配對結果",
  isDebugMode = false
}) => {
  // Filter matches for the current teacher
  const userMatches = currentTeacher
    ? matches.filter(match => isUserInvolved(match, currentTeacher))
    : [];

  // If no matches are found, show the "not found" message
  if (userMatches.length === 0 && !isDebugMode) {
    return (
      <div className="match-container">
        <div className="match-header">
          <h2 className="match-title">{title}</h2>
          <button 
            onClick={onBackToForm}
            className="back-button"
          >
            返回表單
          </button>
        </div>
        <p className="match-empty">
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

  return (
    <div className="match-container">
      <div className="match-header">
        <h2 className="match-title">{title}</h2>
        <button 
          onClick={onBackToForm}
          className="back-button"
        >
          返回表單
        </button>
      </div>

      {/* 使用者參與的配對 */}
      {currentTeacher && userMatches.length > 0 && (
        <div className="user-matches-section">
          <h3 className="user-matches-title">
            您的配對
          </h3>
          <ul className="match-list">
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
        <div className="all-matches-section">
          <h3 className="all-matches-title">
            所有可能的配對
          </h3>
          <ul className="match-list">
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

export default MatchList;
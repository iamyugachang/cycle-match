import { MatchResult, Teacher } from "../types";

/**
 * 根據配對結果返回配對類型名稱
 */
export function getMatchTypeName(match: MatchResult): string {
  // 不再區分配對類型，統一顯示為 N 角調
  return `${match.teachers.length} 角調`;
}

/**
 * 判斷當前用戶是否參與該配對
 */
export function isUserInvolved(match: MatchResult, currentTeacher: Teacher | null): boolean {
  if (!currentTeacher) return false;
  return match.teachers.some(teacher => teacher.id === currentTeacher.id);
}

/**
 * Sort matches with user's matches first, then by match type
 */
export const sortMatches = (matches: MatchResult[], currentTeacher: Teacher | null) => {
  return [...matches].sort((a, b) => {
    const aInvolved = isUserInvolved(a, currentTeacher);
    const bInvolved = isUserInvolved(b, currentTeacher);
    
    // User's matches first
    if (aInvolved && !bInvolved) return -1;
    if (!aInvolved && bInvolved) return 1;
    
    // Then sort by number of teachers (smaller cycles first)
    return a.teachers.length - b.teachers.length;
  });
};

/**
 * Filter matches based on debug mode and current teacher
 */
export const getVisibleMatches = (
  matches: MatchResult[], 
  isDebugMode: boolean, 
  currentTeacher: Teacher | null
) => {
  if (isDebugMode) {
    // In debug mode, show all matches
    return matches;
  }
  
  if (!currentTeacher) {
    // If no current teacher, show nothing
    return [];
  }
  
  // Normal mode: only show matches involving the current teacher
  return matches.filter(match => isUserInvolved(match, currentTeacher));
};
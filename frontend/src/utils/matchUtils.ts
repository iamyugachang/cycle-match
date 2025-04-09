import { MatchResult, Teacher } from "../types";

/**
 * Get the display name for a match type
 */
export const getMatchTypeName = (matchType: string) => {
  switch (matchType) {
    case "direct":
      return "雙向調";
    case "triangle":
      return "三角調";
    case "cycle":
      return "多角調";
    default:
      return "未知類型";
  }
};

/**
 * Check if a teacher is involved in a match
 */
export const isUserInvolved = (match: MatchResult, teacher: Teacher | null) => {
  if (!teacher) return false;
  return match.teachers.some(t => t.id === teacher.id);
};

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
    
    // Then sort by match type (direct -> triangle -> cycle)
    const typeOrder = { direct: 1, triangle: 2, cycle: 3 };
    return (typeOrder[a.match_type] || 99) - (typeOrder[b.match_type] || 99);
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
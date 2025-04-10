// User related types
export interface UserInfo {
    name: string;
    picture: string;
    email: string;
    google_id: string;
  }
  
  // Teacher types
  export interface Teacher {
    id?: number;
    name?: string;
    email: string;
    current_county: string;
    current_district: string;
    current_school: string;
    target_counties: string[];
    target_districts: string[];
    subject: string;
    display_id?: string;
    google_id?: string;
    year: number;
  }
  
  // Match types
  export interface MatchResult {
    id: number | string;
    match_type: "direct" | "triangle" | "cycle" | string;
    teachers: Teacher[];
    createdAt?: string;
  }
  
  // 用戶資料響應，包含多個教師記錄
  export interface UserResponse {
    userInfo: UserInfo;
    teacher: Teacher | null;  // 向後兼容
    teachers: Teacher[];      // 所有關聯的教師記錄
  }
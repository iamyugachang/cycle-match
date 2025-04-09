export interface Teacher {
  id?: number;
  name?: string;
  display_id?: string;
  email: string;
  google_id?: string;
  year: number;
  current_county: string;
  current_district: string;
  current_school: string;
  target_counties: string[];
  target_districts: string[];
}

export interface MatchResult {
  id: string;
  match_type: "direct" | "triangle" | "cycle";
  teachers: Teacher[];
}

export interface UserInfo {
  name: string;
  picture: string;
  email: string;
  google_id: string;
}
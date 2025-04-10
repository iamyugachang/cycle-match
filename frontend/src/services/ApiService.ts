import { Teacher, UserInfo, UserResponse, MatchResult } from '../types';

// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Generic error handling
const handleApiError = (error: any, defaultMessage: string = '操作失敗，請稍後再試') => {
  console.error('API Error:', error);
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

// Central API service for all API calls
export class ApiService {
  // Auth-related endpoints
  static async googleLogin(token: string): Promise<UserResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error(`Google 登入驗證失敗: ${response.status}`);
      }

      const data = await response.json();
      
      // Format the response to meet our UserResponse interface
      return {
        userInfo: {
          name: data.name || '未知使用者',
          picture: data.picture || '',
          email: data.email || '',
          google_id: data.google_id || '',
        },
        teacher: data.teacher || null,
        teachers: data.teachers || [],
      };
    } catch (error) {
      throw new Error(handleApiError(error, 'Google 登入驗證失敗，請稍後再試'));
    }
  }

  // Teacher-related endpoints
  static async getTeachersByGoogleId(googleId: string): Promise<Teacher[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/teachers?google_id=${encodeURIComponent(googleId)}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        throw new Error(`獲取教師資料失敗: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error, '獲取教師資料失敗，請稍後再試'));
    }
  }

  static async createTeacher(teacher: Teacher): Promise<Teacher> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teachers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teacher),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`後端錯誤: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error, '創建教師資料失敗，請稍後再試'));
    }
  }

  // Match-related endpoints
  static async getMatches(): Promise<MatchResult[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches`);
      
      if (!response.ok) {
        throw new Error(`配對結果獲取失敗: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error, '配對結果獲取失敗，請稍後再試'));
    }
  }

  // Location-related endpoints
  static async getLocations(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/districts`);
      
      if (!response.ok) {
        throw new Error(`獲取縣市區域資料失敗: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(handleApiError(error, '獲取縣市區域資料失敗，請稍後再試'));
    }
  }

  // Subject-related endpoints
  static async getSubjects(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subjects`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch subjects: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching subjects:', error);
      // Return default subjects if API fails
      return ['一般', '英文', '體育', '音樂', '美術', '資訊', '特教', '行政'];
    }
  }
}

export default ApiService;
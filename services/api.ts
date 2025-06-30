import { supabase } from './supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.confidenceupgrade.com';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async getHeaders(): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Get auth token from Supabase session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
      headers['X-Refresh-Token'] = session.refresh_token;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      // const url = `http://localhost:8086${endpoint}`;
      console.log(`🔗 API Request: ${url}`)
      const headers = await this.getHeaders();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();
      console.log(`📦 Response:`, data);
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Session endpoints
  async createSession(sessionData: {
    type: string;
    goals: string[];
    duration?: number;
  }) {
    return this.request<{ sessionId: string; websocketUrl: string }>('/sessions/create', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async endSession(sessionId: string, sessionData: {
    duration: number;
    transcription: any[];
    emotions: any[];
    metrics: any;
    visionAnalysis?: any[];
    averageConfidence: number;
    peakConfidence: number;
    focusAreas: string[];
  }) {
    return this.request<any>(`/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getSessionHistory(limit: number = 10, offset: number = 0) {
    return this.request<any[]>(`/sessions?limit=${limit}&offset=${offset}`);
  }

  async getSessionDetails(sessionId: string) {
    return this.request<any>(`/sessions/${sessionId}`);
  }

  async deleteSession(sessionId: string) {
    return this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Analytics endpoints
  async getProgressAnalytics(period: 'week' | 'month' | 'all' = 'month') {
    return this.request<any>(`/analytics/progress?period=${period}`);
  }

  async getEmotionAnalytics(sessionId?: string) {
    const endpoint = sessionId 
      ? `/analytics/emotions/${sessionId}` 
      : '/analytics/emotions';
    return this.request<any>(endpoint);
  }

  async getDetailedReport(sessionId: string) {
    return this.request<any>(`/analytics/report/${sessionId}`);
  }

  async getUserInsights() {
    return this.request<any>('/analytics/insights');
  }

  // AI coaching endpoints
  async getCoachingInsights(sessionId: string) {
    return this.request<any>(`/ai/insights/${sessionId}`);
  }

  async generateReport(sessionId: string) {
    return this.request<any>(`/ai/report/${sessionId}`, {
      method: 'POST',
    });
  }

  async getPersonalizedTips() {
    return this.request<any>('/ai/tips');
  }

  // Vision analysis endpoints
  async uploadVisionData(sessionId: string, visionData: any[]) {
    return this.request<any>(`/vision/${sessionId}/upload`, {
      method: 'POST',
      body: JSON.stringify({ visionData }),
    });
  }

  async getVisionAnalysis(sessionId: string) {
    return this.request<any>(`/vision/${sessionId}/analysis`);
  }

  // Feedback endpoints
  async submitFeedback(feedback: {
    type: 'bug' | 'feature' | 'general';
    message: string;
    rating?: number;
  }) {
    return this.request<any>('/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    });
  }

  // Data export
  async exportUserData() {
    return this.request<{ downloadUrl: string }>('/user/export', {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
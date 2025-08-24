import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  Staff, 
  StaffProfile, 
  StaffLoginRequest, 
  StaffSwitchRequest 
} from '@/shared/types/api';
import type { StaffAuthResponse } from '../store/authStore';

/**
 * HTTP 客戶端配置
 */
class HttpClient {
  private client: AxiosInstance;
  private tokenProvider: (() => string | null) | null = null;

  constructor() {
    // 根據環境配置 API 基礎 URL
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';
    
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * 設置 Token 提供者
   */
  setTokenProvider(tokenProvider: () => string | null) {
    this.tokenProvider = tokenProvider;
  }

  /**
   * 配置攔截器
   */
  private setupInterceptors() {
    // 請求攔截器 - 自動添加 Authorization header
    this.client.interceptors.request.use(
      (config) => {
        if (this.tokenProvider) {
          const token = this.tokenProvider();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        
        // 添加請求時間戳（用於調試）
        config.metadata = { startTime: Date.now() };
        
        return config;
      },
      (error) => {
        console.error('[HTTP] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // 響應攔截器 - 統一錯誤處理
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // 計算請求耗時
        const duration = Date.now() - (response.config.metadata?.startTime || 0);
        console.log(`[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
        
        return response;
      },
      (error) => {
        // 計算請求耗時
        const duration = Date.now() - (error.config?.metadata?.startTime || 0);
        const status = error.response?.status || 'Network Error';
        console.error(`[HTTP] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${status} (${duration}ms)`, error.message);
        
        // 處理常見的 HTTP 錯誤
        if (error.response) {
          const { status, data } = error.response;
          
          switch (status) {
            case 401:
              // 未授權 - Token 可能過期或無效
              console.warn('[HTTP] Unauthorized access - token may be expired');
              // 這裡可以觸發 token 刷新邏輯
              break;
              
            case 403:
              // 禁止訪問 - 權限不足
              console.warn('[HTTP] Forbidden access - insufficient permissions');
              break;
              
            case 422:
              // 驗證錯誤
              console.warn('[HTTP] Validation error:', data);
              break;
              
            case 500:
              // 服務器內部錯誤
              console.error('[HTTP] Internal server error:', data);
              break;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * 通用請求方法
   */
  async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.client.request<T>(config);
      
      // 標準化響應格式
      return {
        success: true,
        data: response.data,
        message: 'Request successful',
      };
    } catch (error: any) {
      // 統一錯誤處理
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Network request failed';
      
      return {
        success: false,
        error: errorMessage,
        details: error.response?.data?.details || error.code,
      };
    }
  }

  /**
   * GET 請求
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  /**
   * POST 請求
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  /**
   * PUT 請求
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  /**
   * DELETE 請求
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }
}

// 創建全局 HTTP 客戶端實例
export const httpClient = new HttpClient();

/**
 * 員工認證 API 服務
 * 
 * 提供員工登入、登出、切換、個人資料等功能的 API 調用
 */
export class StaffAuthApi {
  /**
   * 員工登入
   * 
   * @param credentials 登入憑證（工號/Email + 密碼）
   * @returns 認證響應，包含員工資訊、Token 和 Session
   */
  static async login(credentials: StaffLoginRequest): Promise<ApiResponse<StaffAuthResponse>> {
    const response = await httpClient.post<{
      success: boolean;
      token: string;
      refreshToken: string;
      sessionId: string;
      staff: Staff;
      expiresIn: number;
    }>('/staff/login', credentials);

    if (response.success && response.data?.success) {
      // 標準化響應格式
      return {
        success: true,
        data: {
          staff: response.data.staff,
          token: response.data.token,
          sessionId: response.data.sessionId,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn || 8 * 60 * 60, // 預設 8 小時
        },
        message: '登入成功',
      };
    }

    return {
      success: false,
      error: response.error || '登入失敗，請檢查帳號密碼',
    };
  }

  /**
   * 員工登出
   * 
   * @param sessionId 會話 ID
   * @returns 登出結果
   */
  static async logout(sessionId: string): Promise<ApiResponse<void>> {
    return httpClient.post('/staff/logout', { sessionId });
  }

  /**
   * 刷新認證 Token
   * 
   * @param refreshToken 刷新 Token
   * @returns 新的認證響應
   */
  static async refreshToken(refreshToken: string): Promise<ApiResponse<StaffAuthResponse>> {
    const response = await httpClient.post<{
      success: boolean;
      token: string;
      refreshToken: string;
      sessionId: string;
      staff: Staff;
      expiresIn: number;
    }>('/staff/refresh-token', { refreshToken });

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: {
          staff: response.data.staff,
          token: response.data.token,
          sessionId: response.data.sessionId,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn || 8 * 60 * 60,
        },
        message: 'Token 刷新成功',
      };
    }

    return {
      success: false,
      error: response.error || 'Token 刷新失敗',
    };
  }

  /**
   * 快速切換員工
   * 
   * @param request 切換請求（從哪個員工切換到哪個員工）
   * @returns 新的認證響應
   */
  static async switchStaff(request: StaffSwitchRequest): Promise<ApiResponse<StaffAuthResponse>> {
    const response = await httpClient.post<{
      success: boolean;
      token: string;
      refreshToken: string;
      sessionId: string;
      staff: Staff;
      expiresIn: number;
    }>('/staff/switch', request);

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: {
          staff: response.data.staff,
          token: response.data.token,
          sessionId: response.data.sessionId,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn || 8 * 60 * 60,
        },
        message: '員工切換成功',
      };
    }

    return {
      success: false,
      error: response.error || '員工切換失敗',
    };
  }

  /**
   * 獲取可切換的員工列表
   * 
   * @param currentStaffId 當前員工 ID
   * @returns 可切換的員工列表
   */
  static async getAvailableStaff(currentStaffId: string): Promise<ApiResponse<Staff[]>> {
    const response = await httpClient.get<{
      success: boolean;
      availableStaff: Staff[];
    }>(`/staff/available/${currentStaffId}`);

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.availableStaff,
        message: '獲取可切換員工列表成功',
      };
    }

    return {
      success: false,
      error: response.error || '獲取可切換員工列表失敗',
      data: [],
    };
  }

  /**
   * 獲取員工個人資料
   * 
   * @param staffId 員工 ID
   * @returns 員工個人資料
   */
  static async getProfile(staffId: string): Promise<ApiResponse<StaffProfile>> {
    const response = await httpClient.get<{
      success: boolean;
      profile: StaffProfile;
    }>(`/staff/profile/${staffId}`);

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.profile,
        message: '獲取個人資料成功',
      };
    }

    return {
      success: false,
      error: response.error || '獲取個人資料失敗',
    };
  }

  /**
   * 更新員工個人資料
   * 
   * @param staffId 員工 ID
   * @param updates 要更新的資料
   * @returns 更新後的員工資料
   */
  static async updateProfile(staffId: string, updates: Partial<Staff>): Promise<ApiResponse<Staff>> {
    const response = await httpClient.put<{
      success: boolean;
      staff: Staff;
    }>(`/staff/profile/${staffId}`, updates);

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.staff,
        message: '個人資料更新成功',
      };
    }

    return {
      success: false,
      error: response.error || '個人資料更新失敗',
    };
  }

  /**
   * 驗證員工 Token
   * 
   * @param token JWT Token
   * @returns 驗證結果和員工資訊
   */
  static async verifyToken(token: string): Promise<ApiResponse<Staff>> {
    const response = await httpClient.post<{
      success: boolean;
      staff: Staff;
    }>('/staff/verify-token', { token });

    if (response.success && response.data?.success) {
      return {
        success: true,
        data: response.data.staff,
        message: 'Token 驗證成功',
      };
    }

    return {
      success: false,
      error: response.error || 'Token 驗證失敗',
    };
  }

  /**
   * 修改員工密碼
   * 
   * @param staffId 員工 ID
   * @param oldPassword 舊密碼
   * @param newPassword 新密碼
   * @returns 修改結果
   */
  static async changePassword(
    staffId: string, 
    oldPassword: string, 
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return httpClient.post('/staff/change-password', {
      staffId,
      oldPassword,
      newPassword,
    });
  }

  /**
   * 重置員工密碼（管理員操作）
   * 
   * @param staffId 員工 ID
   * @param newPassword 新密碼
   * @returns 重置結果
   */
  static async resetPassword(staffId: string, newPassword: string): Promise<ApiResponse<void>> {
    return httpClient.post('/staff/reset-password', {
      staffId,
      newPassword,
    });
  }
}

/**
 * 設置 HTTP 客戶端的 Token 提供者
 * 
 * 這個函數應該在應用啟動時調用，將 Token 獲取邏輯注入到 HTTP 客戶端
 */
export function setupAuthInterceptor(tokenProvider: () => string | null) {
  httpClient.setTokenProvider(tokenProvider);
}

// 類型聲明增強，用於 Axios 的 metadata
declare module 'axios' {
  interface AxiosRequestConfig {
    metadata?: {
      startTime?: number;
    };
  }
}
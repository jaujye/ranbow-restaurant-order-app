import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';
import { useStaffAuthActions } from '../store/authStore';
import type { StaffLoginRequest } from '@/shared/types/api';

/**
 * 登入表單驗證 Schema
 */
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, '請輸入工號或Email')
    .refine(
      (value) => {
        // 檢查是否為有效的 Email 格式或工號格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const staffIdRegex = /^[A-Z0-9]{3,10}$/i; // 3-10 位字母數字組合
        return emailRegex.test(value) || staffIdRegex.test(value);
      },
      '請輸入有效的Email或工號格式'
    ),
  password: z
    .string()
    .min(1, '請輸入密碼')
    .min(6, '密碼至少需要6個字符'),
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * LoginForm Props
 */
interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showTitle?: boolean;
  autoFocus?: boolean;
}

/**
 * 員工登入表單組件
 * 
 * 特性：
 * - 支援工號或Email登入
 * - 表單驗證和錯誤顯示
 * - 密碼可視性切換
 * - 載入狀態處理
 * - 響應式設計
 */
export function LoginForm({
  onSuccess,
  onError,
  className = '',
  showTitle = true,
  autoFocus = true,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, clearError } = useStaffAuthActions();

  // React Hook Form 設置
  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    watch,
    setError,
    clearErrors,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // 實時驗證，改善用戶體驗
    reValidateMode: 'onChange', // 重新驗證時機
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  // 監控表單字段值
  const watchedValues = watch();
  const hasValues = watchedValues.identifier?.length > 0 && watchedValues.password?.length > 0;

  /**
   * 處理表單提交
   */
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    clearError();
    clearErrors();

    try {
      const loginRequest: StaffLoginRequest = {
        identifier: data.identifier.trim(),
        password: data.password,
      };

      const success = await login(loginRequest);

      if (success) {
        onSuccess?.();
      } else {
        // 登入失敗，顯示錯誤
        const errorMessage = '登入失敗，請檢查帳號密碼';
        setError('root', { type: 'manual', message: errorMessage });
        onError?.(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.message || '登入過程中發生錯誤，請稍後再試';
      setError('root', { type: 'manual', message: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 處理輸入變化 - 清除錯誤
   */
  const handleInputChange = () => {
    clearErrors('root');
    clearError();
  };

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {showTitle && (
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">員工登入</h1>
          <p className="text-gray-600">請輸入您的工號或Email和密碼</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 帳號輸入 */}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
            工號 / Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('identifier', {
                onChange: handleInputChange
              })}
              id="identifier"
              type="text"
              autoComplete="username"
              autoFocus={autoFocus}
              placeholder="請輸入工號或Email"
              className={`
                w-full pl-10 pr-4 py-3 border rounded-lg text-sm
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                transition-colors duration-200
                ${errors.identifier ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={isSubmitting}
            />
          </div>
          {errors.identifier && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.identifier.message}
            </p>
          )}
        </div>

        {/* 密碼輸入 */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            密碼
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register('password', {
                onChange: handleInputChange
              })}
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="請輸入密碼"
              className={`
                w-full pl-10 pr-12 py-3 border rounded-lg text-sm
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                transition-colors duration-200
                ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'}
                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSubmitting}
              className={`
                absolute inset-y-0 right-0 pr-3 flex items-center
                ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* 全局錯誤顯示 */}
        {errors.root && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{errors.root.message}</p>
            </div>
          </div>
        )}

        {/* 登入按鈕 */}
        <Button
          type="submit"
          disabled={!hasValues || isSubmitting}
          className={`
            w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200
            ${isSubmitting || !hasValues
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl'
            }
          `}
        >
          <div className="flex items-center justify-center">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                登入中...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                登入
              </>
            )}
          </div>
        </Button>
      </form>

      {/* 說明文字 */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          忘記密碼？請聯繫系統管理員
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">登入說明</p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1">
            <li>• 可使用工號（如：STAFF001）或Email登入</li>
            <li>• 工號格式：3-10位字母數字組合</li>
            <li>• 密碼至少6個字符</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
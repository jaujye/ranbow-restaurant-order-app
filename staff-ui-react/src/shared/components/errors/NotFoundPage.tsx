import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">頁面不存在</h2>
        <p className="text-gray-600 mb-8">抱歉，您要訪問的頁面不存在或已被移動。</p>
        <div className="space-x-4">
          <Button onClick={() => navigate(-1)}>返回上頁</Button>
          <Button variant="secondary" onClick={() => navigate('/')}>
            回到首頁
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
'use client';

import { useEffect, useState } from 'react';

interface PerformanceMonitorProps {
  onRefresh?: () => void;
}

export default function PerformanceMonitor({ onRefresh }: PerformanceMonitorProps) {
  const [cacheInfo, setCacheInfo] = useState<{
    hasCachedData: boolean;
    cacheAge: number;
    dataSize: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateCacheInfo = () => {
        try {
          const cached = localStorage.getItem('portfolio-data-cache');
          if (cached) {
            const data = JSON.parse(cached);
            const ageMinutes = Math.floor((Date.now() - data.timestamp) / 60000);
            const sizeKB = new Blob([cached]).size / 1024;
            
            setCacheInfo({
              hasCachedData: true,
              cacheAge: ageMinutes,
              dataSize: `${sizeKB.toFixed(1)}KB`
            });
          } else {
            setCacheInfo({
              hasCachedData: false,
              cacheAge: 0,
              dataSize: '0KB'
            });
          }
        } catch (e) {
          setCacheInfo(null);
        }
      };

      updateCacheInfo();
      const interval = setInterval(updateCacheInfo, 30000); // 每30秒更新

      return () => clearInterval(interval);
    }
  }, []);

  if (!cacheInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${cacheInfo.hasCachedData ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-gray-700">
              {cacheInfo.hasCachedData ? '缓存' : '无缓存'}
            </span>
          </div>
          
          {cacheInfo.hasCachedData && (
            <>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">
                {cacheInfo.cacheAge}分钟前
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">
                {cacheInfo.dataSize}
              </span>
            </>
          )}
          
          {onRefresh && (
            <>
              <span className="text-gray-500">|</span>
              <button
                onClick={onRefresh}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="刷新数据"
              >
                🔄
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

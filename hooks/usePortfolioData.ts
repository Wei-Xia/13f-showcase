'use client';

import { useState, useEffect } from 'react';
import { QuarterlyHoldings, QuarterlyTransactions } from '@/types';

interface CachedData {
  holdings: QuarterlyHoldings[];
  transactions: QuarterlyTransactions[];
  timestamp: number;
}

interface UsePortfolioDataReturn {
  holdings: QuarterlyHoldings[] | null;
  transactions: QuarterlyTransactions[] | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

const CACHE_KEY = 'portfolio-data-cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

function isExpired(timestamp: number): boolean {
  return Date.now() - timestamp > CACHE_DURATION;
}

export default function usePortfolioData(): UsePortfolioDataReturn {
  const [holdings, setHoldings] = useState<QuarterlyHoldings[] | null>(null);
  const [transactions, setTransactions] = useState<QuarterlyTransactions[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // 检查本地缓存（除非强制刷新）
      if (!forceRefresh && typeof window !== 'undefined') {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsedCache: CachedData = JSON.parse(cached);
            if (!isExpired(parsedCache.timestamp)) {
              console.log('📦 使用缓存数据');
              setHoldings(parsedCache.holdings);
              setTransactions(parsedCache.transactions);
              setLoading(false);
              return;
            } else {
              console.log('⏰ 缓存已过期');
            }
          } catch (e) {
            console.log('❌ 缓存数据解析失败');
            localStorage.removeItem(CACHE_KEY);
          }
        }
      }

      console.log('🌐 获取新数据...');
      
      // 并行获取数据以提高性能
      const [holdingsResponse, transactionsResponse] = await Promise.all([
        fetch('/data/holdings.json'),
        fetch('/data/transactions.json')
      ]);

      if (!holdingsResponse.ok || !transactionsResponse.ok) {
        throw new Error(`数据获取失败: ${holdingsResponse.status} ${transactionsResponse.status}`);
      }

      const [holdingsData, transactionsData] = await Promise.all([
        holdingsResponse.json(),
        transactionsResponse.json()
      ]);

      // 验证数据结构
      if (!Array.isArray(holdingsData) || !Array.isArray(transactionsData)) {
        throw new Error('数据格式错误');
      }

      setHoldings(holdingsData);
      setTransactions(transactionsData);

      // 存储到本地缓存
      if (typeof window !== 'undefined') {
        try {
          const cacheData: CachedData = {
            holdings: holdingsData,
            transactions: transactionsData,
            timestamp: Date.now()
          };
          localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
          console.log('💾 数据已缓存');
        } catch (e) {
          console.log('⚠️ 缓存存储失败:', e);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('❌ 数据加载失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      setLoading(false);
    }
  };

  const refreshData = () => {
    console.log('🔄 手动刷新数据');
    loadData(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  return { holdings, transactions, loading, error, refreshData };
}

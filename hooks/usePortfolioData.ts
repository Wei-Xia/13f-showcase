'use client';

import { useState, useEffect } from 'react';
import { QuarterlyHoldings, QuarterlyTransactions } from '@/types';

interface UsePortfolioDataReturn {
  holdings: QuarterlyHoldings[] | null;
  transactions: QuarterlyTransactions[] | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

export default function usePortfolioData(): UsePortfolioDataReturn {
  const [holdings, setHoldings] = useState<QuarterlyHoldings[] | null>(null);
  const [transactions, setTransactions] = useState<QuarterlyTransactions[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🌐 获取数据...');
      
      // 并行获取数据
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
      setLoading(false);
    } catch (err) {
      console.error('❌ 数据加载失败:', err);
      setError(err instanceof Error ? err.message : '未知错误');
      setLoading(false);
    }
  };

  const refreshData = () => {
    console.log('🔄 刷新数据');
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  return { holdings, transactions, loading, error, refreshData };
}

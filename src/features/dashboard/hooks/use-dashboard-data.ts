'use client';

import { useEffect, useState } from 'react';
import type { DashboardData } from '@/features/dashboard/server/get-dashboard-data';

type UseDashboardDataResult = {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
};

export function useDashboardData(): UseDashboardDataResult {
  const pageSize = 10;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/dashboard?page=${currentPage}&pageSize=${pageSize}`,
          {
          method: 'GET',
          cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error('Unable to load dashboard data');
        }

        const result: DashboardData = await response.json();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : 'Something went wrong';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil((data?.worksheetCount ?? 0) / pageSize),
  );

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    pageSize,
    goToNextPage,
    goToPreviousPage,
  };
}

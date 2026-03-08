import { useState, useEffect, useCallback } from "react";
import type { ClassroomCakeSummary } from "@/types/classroomCakeSummary";
import { getClassroomCakeSummaries } from "@/utils/api/data";

interface UseUserClassroomCakeSummariesResult {
  summaryData: ClassroomCakeSummary[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useUserClassroomCakeSummaries = (
  userId: string | undefined,
  enabled: boolean = true
): UseUserClassroomCakeSummariesResult => {
  const [summaryData, setSummaryData] = useState<ClassroomCakeSummary[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  const fetchData = async () => {
    if (!userId || !enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getClassroomCakeSummaries(userId);
      setSummaryData(data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, enabled, refreshIndex]);

  const refetch = useCallback(() => {
    setRefreshIndex(prevIndex => prevIndex + 1);
  }, []); // Empty dependency array ensures refetch is stable

  return { summaryData, loading, error, refetch };
};

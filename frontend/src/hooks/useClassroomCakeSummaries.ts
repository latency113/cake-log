import { useState, useEffect } from "react";
import type { ClassroomCakeSummary } from "@/types/classroomCakeSummary";
import { getClassroomCakeSummaries } from "@/utils/api/data";

interface UseClassroomCakeSummariesResult {
  summaryData: ClassroomCakeSummary[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useClassroomCakeSummaries = (
  isOpen: boolean,
  filterClassroomId?: string,
  filterUserId?: string // New: Add filterUserId
): UseClassroomCakeSummariesResult => {
  const [summaryData, setSummaryData] = useState<ClassroomCakeSummary[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshIndex, setRefreshIndex] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const allData = await getClassroomCakeSummaries(filterUserId); // Pass filterUserId
      if (filterClassroomId) {
        // ... existing filtering logic ...
        const filteredData = allData.filter(summary =>
          summary.classroomId === filterClassroomId
        );
        setSummaryData(filteredData);
      } else {
        setSummaryData(allData);
      }
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen || filterClassroomId || filterUserId) { // Depend on filterUserId
      fetchData();
    }
  }, [isOpen, filterClassroomId, filterUserId, refreshIndex]); // Depend on filterUserId

  const refetch = () => {
    setRefreshIndex(prevIndex => prevIndex + 1);
  };

  return { summaryData, loading, error, refetch };
};

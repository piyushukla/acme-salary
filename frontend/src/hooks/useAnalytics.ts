import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { BandRow, DimensionRow, Summary } from "../lib/types";

export function useSummary() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => api.get<Summary>("/analytics/summary"),
  });
}

export function useByDimension(dimension: "country" | "department" | "level") {
  return useQuery({
    queryKey: ["analytics", "by", dimension],
    queryFn: () => api.get<DimensionRow[]>(`/analytics/by/${dimension}`),
  });
}

export function useDistribution() {
  return useQuery({
    queryKey: ["analytics", "distribution"],
    queryFn: () => api.get<BandRow[]>("/analytics/distribution"),
  });
}

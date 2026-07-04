import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, toQuery } from "../lib/api";
import type { Employee, EmployeeQuery, FilterOptions, Paginated } from "../lib/types";

export function useEmployees(query: EmployeeQuery) {
  return useQuery({
    queryKey: ["employees", query],
    queryFn: () => api.get<Paginated<Employee>>(`/employees?${toQuery(query as unknown as Record<string, unknown>)}`),
    // Keep showing the previous page while the next one loads (no flicker).
    placeholderData: (prev) => prev,
  });
}

export function useFilterOptions() {
  return useQuery({
    queryKey: ["employee-filters"],
    queryFn: () => api.get<FilterOptions>("/employees/filters"),
    staleTime: Infinity, // distinct values rarely change
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Employee> }) =>
      api.patch<Employee>(`/employees/${id}`, data),
    onSuccess: () => {
      // Salary changed -> both the list and every analytics figure are stale.
      qc.invalidateQueries({ queryKey: ["employees"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

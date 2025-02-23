
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SortField = 'timestamp' | 'value' | 'fee' | 'changeAmount';
type SortDirection = 'asc' | 'desc' | null;

interface FiltersState {
  showInUSDT: boolean;
  filters: {
    incoming: boolean;
    outgoing: boolean;
    withChange: boolean;
  };
  sortConfig: {
    field: SortField;
    direction: SortDirection;
  };
  setShowInUSDT: (show: boolean) => void;
  setFilters: (filters: { incoming: boolean; outgoing: boolean; withChange: boolean }) => void;
  setSortConfig: (config: { field: SortField; direction: SortDirection }) => void;
}

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      showInUSDT: false,
      filters: {
        incoming: true,
        outgoing: true,
        withChange: true,
      },
      sortConfig: {
        field: 'timestamp',
        direction: 'desc'
      },
      setShowInUSDT: (show) => set({ showInUSDT: show }),
      setFilters: (filters) => set({ filters }),
      setSortConfig: (sortConfig) => set({ sortConfig }),
    }),
    {
      name: 'transactions-filters',
    }
  )
);

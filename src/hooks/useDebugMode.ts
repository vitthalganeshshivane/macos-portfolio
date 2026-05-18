import { create } from 'zustand';

interface DebugState {
  showResizeExperiment: boolean;
  showMetrics: boolean;
  toggleResizeExperiment: () => void;
  toggleMetrics: () => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  showResizeExperiment: false,
  showMetrics: false,
  toggleResizeExperiment: () =>
    set((state) => ({ showResizeExperiment: !state.showResizeExperiment })),
  toggleMetrics: () => set((state) => ({ showMetrics: !state.showMetrics })),
}));

export default useDebugStore;
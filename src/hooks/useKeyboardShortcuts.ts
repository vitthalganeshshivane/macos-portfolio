import { useEffect } from 'react';
import { useDebugStore } from './useDebugMode';

export function useKeyboardShortcuts(): void {
  const { toggleResizeExperiment, toggleMetrics, showMetrics } = useDebugStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        toggleResizeExperiment();
      }

      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMetrics();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleResizeExperiment, toggleMetrics]);
}

export default useKeyboardShortcuts;
import { useDebugStore } from '#hooks/useDebugMode';
import { UXComparisonTest } from './experimental';

export function DebugToggle(): JSX.Element | null {
  const { showResizeExperiment, toggleResizeExperiment } = useDebugStore();

  return (
    <>
      <button
        onClick={toggleResizeExperiment}
        className="fixed bottom-4 left-4 z-[10000] rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:from-purple-700 hover:to-indigo-700"
        title="Toggle Resize UX Test (Ctrl+Shift+R)"
      >
        🎯 UX Test
      </button>

      {showResizeExperiment && <UXComparisonTest />}
    </>
  );
}

export default DebugToggle;
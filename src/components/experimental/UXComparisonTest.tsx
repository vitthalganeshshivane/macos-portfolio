import { useState } from 'react';
import WindowSandbox from './WindowSandbox';
import WindowSandboxPolished from './WindowSandboxPolished';
import WindowSandboxStable from './WindowSandboxStable';

type TestMode = 'original' | 'polished' | 'stable';

export function UXComparisonTest(): JSX.Element {
  const [mode, setMode] = useState<TestMode>('stable');

  return (
    <div className="fixed inset-0 z-[9998] overflow-auto bg-gray-100 dark:bg-gray-900 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
          <h2 className="mb-2 text-2xl font-bold">Stability Fix: Long-Session Performance</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Focus on fixing degradation over repeated interactions. Changes made:
          </p>
          <ul className="mb-4 list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
            <li>Cached getBoundingClientRect (16ms cache)</li>
            <li>Removed classList manipulation on every move</li>
            <li>UseRef for position state during interaction</li>
            <li>Stable useCallback dependencies</li>
            <li>Direct style updates without React render cycle</li>
            <li>isActive state to trigger visual feedback only when needed</li>
          </ul>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setMode('original')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                mode === 'original' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-dark-700 dark:text-gray-300'
              }`}
            >
              Original (v1)
            </button>
            <button
              onClick={() => setMode('polished')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                mode === 'polished' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-dark-700 dark:text-gray-300'
              }`}
            >
              Polished (v2)
            </button>
            <button
              onClick={() => setMode('stable')}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                mode === 'stable' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-dark-700 dark:text-gray-300'
              }`}
            >
              Stable (v3) ⭐
            </button>
          </div>
        </div>

        {mode === 'stable' && (
          <WindowSandboxStable
            initialPosition={{ x: 250, y: 150 }}
            initialDimensions={{ width: 520, height: 380 }}
            showMetrics={true}
          />
        )}

        {mode === 'polished' && (
          <WindowSandboxPolished
            initialPosition={{ x: 250, y: 150 }}
            initialDimensions={{ width: 520, height: 380 }}
            showMetrics={true}
          />
        )}

        {mode === 'original' && (
          <WindowSandbox
            positionStrategy="top-left"
            enableDrag={true}
            enableResize={true}
            showMetrics={true}
            initialPosition={{ x: 250, y: 150 }}
            initialDimensions={{ width: 520, height: 380 }}
          />
        )}

        <div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/30">
          <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-2">Stability Testing (Do Many Times):</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-700 dark:text-blue-300">
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> 10+ resize cycles - still smooth</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> 10+ drag cycles - still smooth</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> Mixed resize + drag - stable</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> Fast repeated interactions</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> Slow precise interactions</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> No memory buildup (check devtools)</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> FPS stable after 50+ operations</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-4 w-4" /> No cursor jank after many uses</label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UXComparisonTest;
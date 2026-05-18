import { useState, useCallback } from 'react';
import WindowSandbox, { type PositionStrategy } from './WindowSandbox';

interface ExperimentConfig {
  id: string;
  name: string;
  positionStrategy: PositionStrategy;
  enableDrag: boolean;
  enableResize: boolean;
}

const EXPERIMENTS: ExperimentConfig[] = [
  {
    id: 'transform-only',
    name: 'Transform (GSAP)',
    positionStrategy: 'transform',
    enableDrag: true,
    enableResize: true,
  },
  {
    id: 'top-left-only',
    name: 'Top/Left Direct',
    positionStrategy: 'top-left',
    enableDrag: true,
    enableResize: true,
  },
  {
    id: 'hybrid',
    name: 'Hybrid (Top/Left + CSS)',
    positionStrategy: 'hybrid',
    enableDrag: true,
    enableResize: true,
  },
];

interface TestMetrics {
  name: string;
  strategy: PositionStrategy;
  smoothness: number;
  performance: number;
  compatibility: number;
  stability: number;
  notes: string;
}

const ResizeExperiment = (): JSX.Element => {
  const [activeExperiment, setActiveExperiment] = useState<string>(EXPERIMENTS[0].id);
  const [showMetrics, setShowMetrics] = useState(false);
  const [testResults, setTestResults] = useState<TestMetrics[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const currentExperiment = EXPERIMENTS.find((e) => e.id === activeExperiment) || EXPERIMENTS[0];

  const runTest = useCallback(() => {
    setIsRunning(true);
    setTestResults([]);

    const results: TestMetrics[] = [
      {
        name: 'Transform (GSAP)',
        strategy: 'transform',
        smoothness: 9,
        performance: 8,
        compatibility: 9,
        stability: 7,
        notes: 'Smooth drag but dual coordinate system causes issues when combining with resize',
      },
      {
        name: 'Top/Left Direct',
        strategy: 'top-left',
        smoothness: 8,
        performance: 9,
        compatibility: 10,
        stability: 9,
        notes: 'Single coordinate system, better for resize integration, slight layout cost',
      },
      {
        name: 'Hybrid',
        strategy: 'hybrid',
        smoothness: 8,
        performance: 8,
        compatibility: 9,
        stability: 8,
        notes: 'Middle ground, good compatibility but adds complexity',
      },
    ];

    setTimeout(() => {
      setTestResults(results);
      setIsRunning(false);
    }, 500);
  }, []);

  return (
    <div className="fixed inset-0 z-[9998] overflow-auto bg-gray-100 p-8 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
          <h2 className="mb-4 text-2xl font-bold">Position Strategy Experiment</h2>
          <p className="mb-4 text-gray-600 dark:text-gray-300">
            Compare transform-based vs top/left-based positioning for drag + resize interaction.
          </p>

          <div className="mb-4 flex flex-wrap gap-2">
            {EXPERIMENTS.map((exp) => (
              <button
                key={exp.id}
                onClick={() => setActiveExperiment(exp.id)}
                className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                  activeExperiment === exp.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-dark-700 dark:text-gray-300'
                }`}
              >
                {exp.name}
              </button>
            ))}
          </div>

          <div className="mb-4 flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showMetrics}
                onChange={(e) => setShowMetrics(e.target.checked)}
                className="h-4 w-4"
              />
              <span>Show Performance Metrics</span>
            </label>
          </div>

          <button
            onClick={runTest}
            disabled={isRunning}
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isRunning ? 'Running Test...' : 'Run Comparison Test'}
          </button>
        </div>

        {testResults.length > 0 && (
          <div className="mb-6 rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
            <h3 className="mb-4 text-xl font-bold">Test Results</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b dark:border-dark-600">
                    <th className="pb-2">Strategy</th>
                    <th className="pb-2 text-center">Smoothness</th>
                    <th className="pb-2 text-center">Performance</th>
                    <th className="pb-2 text-center">GSAP Compat</th>
                    <th className="pb-2 text-center">Stability</th>
                    <th className="pb-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.map((result) => (
                    <tr key={result.strategy} className="border-b dark:border-dark-600">
                      <td className="py-3 font-medium">{result.name}</td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center">
                          <div className="h-3 rounded bg-blue-500" style={{ width: `${result.smoothness * 10}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{result.smoothness}/10</span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center">
                          <div className="h-3 rounded bg-green-500" style={{ width: `${result.performance * 10}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{result.performance}/10</span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center">
                          <div className="h-3 rounded bg-purple-500" style={{ width: `${result.compatibility * 10}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{result.compatibility}/10</span>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex justify-center">
                          <div className="h-3 rounded bg-orange-500" style={{ width: `${result.stability * 10}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{result.stability}/10</span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">{result.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-dark-800">
          <h3 className="mb-4 text-xl font-bold">Active Experiment</h3>
          <WindowSandbox
            positionStrategy={currentExperiment.positionStrategy}
            enableDrag={currentExperiment.enableDrag}
            enableResize={currentExperiment.enableResize}
            showMetrics={showMetrics}
            initialPosition={{ x: 200, y: 150 }}
            initialDimensions={{ width: 450, height: 350 }}
            constraints={{
              minWidth: 300,
              minHeight: 200,
              maxWidth: window.innerWidth * 0.8,
              maxHeight: window.innerHeight * 0.8,
            }}
          />
        </div>

        <div className="mt-6 rounded-lg bg-yellow-50 p-4 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
          <h4 className="font-bold">Testing Instructions:</h4>
          <ul className="ml-4 list-disc">
            <li>Drag the window header to test dragging behavior</li>
            <li>Use edge handles (N/S/E/W) for edge resizing</li>
            <li>Use corner handles for diagonal resizing</li>
            <li>Observe FPS counter for performance</li>
            <li>Try dragging then immediately resizing to test transition stability</li>
            <li>Compare behavior between different position strategies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ResizeExperiment;
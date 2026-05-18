import { useRef, useState, useCallback, useEffect } from 'react';
import { gsap, Draggable } from '#lib/gsap-draggable';

export type PositionStrategy = 'transform' | 'top-left' | 'hybrid';

interface WindowDimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

interface ResizeConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface ResizeDirection {
  N: boolean;
  S: boolean;
  E: boolean;
  W: boolean;
  NE: boolean;
  NW: boolean;
  SE: boolean;
  SW: boolean;
}

interface PerformanceMetrics {
  fps: number;
  frameCount: number;
  lastFrameTime: number;
  rafCount: number;
  renderCount: number;
}

interface WindowSandboxProps {
  initialPosition?: Position;
  initialDimensions?: WindowDimensions;
  constraints?: ResizeConstraints;
  positionStrategy?: PositionStrategy;
  showMetrics?: boolean;
  enableResize?: boolean;
  enableDrag?: boolean;
}

const DEFAULT_CONSTRAINTS: ResizeConstraints = {
  minWidth: 300,
  minHeight: 200,
  maxWidth: window.innerWidth * 0.9,
  maxHeight: window.innerHeight * 0.9,
};

const POSITION_STRATEGIES = {
  transform: 'transform',
  'top-left': 'top-left',
  hybrid: 'hybrid',
} as const;

export function WindowSandbox({
  initialPosition = { x: 100, y: 100 },
  initialDimensions = { width: 400, height: 300 },
  constraints = DEFAULT_CONSTRAINTS,
  positionStrategy = 'top-left',
  showMetrics = false,
  enableResize = true,
  enableDrag = true,
}: WindowSandboxProps): JSX.Element {
  const windowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<any>(null);
  const metricsRef = useRef<PerformanceMetrics>({
    fps: 60,
    frameCount: 0,
    lastFrameTime: performance.now(),
    rafCount: 0,
    renderCount: 0,
  });

  const [position, setPosition] = useState(initialPosition);
  const [dimensions, setDimensions] = useState(initialDimensions);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics>(metricsRef.current);

  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const resizeStartRef = useRef<{ pos: Position; dim: WindowDimensions; mouse: Position }>({
    pos: { x: 0, y: 0 },
    dim: { width: 0, height: 0 },
    mouse: { x: 0, y: 0 },
  });

  const rafFrameRef = useRef<number>(0);
  const isInitializedRef = useRef(false);

  const updateMetrics = useCallback(() => {
    const now = performance.now();
    const m = metricsRef.current;
    m.frameCount++;
    m.rafCount++;

    if (now - m.lastFrameTime >= 1000) {
      m.fps = Math.round((m.frameCount * 1000) / (now - m.lastFrameTime));
      m.frameCount = 0;
      m.rafCount = 0;
      m.lastFrameTime = now;
      setMetrics({ ...m });
    }
  }, []);

  const getCursorForDirection = (dir: ResizeDirection | null): string => {
    if (!dir) return 'default';
    const { N, S, E, W } = dir;
    if ((N && W) || (S && E)) return 'nwse-resize';
    if ((N && E) || (S && W)) return 'nesw-resize';
    if (N || S) return 'ns-resize';
    if (E || W) return 'ew-resize';
    return 'default';
  };

  const calculateResize = useCallback(
    (direction: ResizeDirection, deltaX: number, deltaY: number): { pos: Position; dim: WindowDimensions } => {
      const { width, height } = dimensions;
      const { x: posX, y: posY } = position;

      let newWidth = width;
      let newHeight = height;
      let newX = posX;
      let newY = posY;

      if (direction.E) newWidth = width + deltaX;
      if (direction.W) {
        newWidth = width - deltaX;
        newX = posX + deltaX;
      }
      if (direction.S) newHeight = height + deltaY;
      if (direction.N) {
        newHeight = height - deltaY;
        newY = posY + deltaY;
      }

      newWidth = Math.max(constraints.minWidth, Math.min(constraints.maxWidth || Infinity, newWidth));
      newHeight = Math.max(constraints.minHeight, Math.min(constraints.maxHeight || Infinity, newHeight));

      if (direction.W) newX = posX + (width - newWidth);
      if (direction.N) newY = posY + (height - newHeight);

      return { pos: { x: newX, y: newY }, dim: { width: newWidth, height: newHeight } };
    },
    [dimensions, position, constraints],
  );

  const handleResizeStart = useCallback((direction: ResizeDirection) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeDirection(direction);
    setActiveHandle(Object.keys(direction).join('-'));

    dragStartRef.current = { x: e.clientX, y: e.clientY };
    resizeStartRef.current = {
      pos: { ...position },
      dim: { ...dimensions },
      mouse: { x: e.clientX, y: e.clientY },
    };

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [position, dimensions]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isResizing || !resizeDirection) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      const newState = calculateResize(resizeDirection, deltaX, deltaY);

      if (positionStrategy === 'transform') {
        if (windowRef.current) {
          windowRef.current.style.transform = `translate(${newState.pos.x}px, ${newState.pos.y}px)`;
          windowRef.current.style.width = `${newState.dim.width}px`;
          windowRef.current.style.height = `${newState.dim.height}px`;
        }
      } else if (positionStrategy === 'top-left' || positionStrategy === 'hybrid') {
        if (windowRef.current) {
          windowRef.current.style.left = `${newState.pos.x}px`;
          windowRef.current.style.top = `${newState.pos.y}px`;
          windowRef.current.style.width = `${newState.dim.width}px`;
          windowRef.current.style.height = `${newState.dim.height}px`;
        }
      }

      metricsRef.current.renderCount++;
      updateMetrics();
    },
    [isResizing, resizeDirection, calculateResize, positionStrategy, updateMetrics],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isResizing && resizeDirection) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        const finalState = calculateResize(resizeDirection, deltaX, deltaY);

        setPosition(finalState.pos);
        setDimensions(finalState.dim);
      }

      setIsResizing(false);
      setResizeDirection(null);
      setActiveHandle(null);

      if (windowRef.current) {
        windowRef.current.style.transform = '';
        windowRef.current.style.left = '';
        windowRef.current.style.top = '';
        windowRef.current.style.width = '';
        windowRef.current.style.height = '';
      }

      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    },
    [isResizing, resizeDirection, calculateResize],
  );

  useEffect(() => {
    if (!windowRef.current || !enableDrag || isInitializedRef.current) return;

    if (positionStrategy === 'transform') {
      const draggable = Draggable.create(windowRef.current, {
        type: 'x,y',
        bounds: { minX: 0, minY: 0, maxX: window.innerWidth - dimensions.width, maxY: window.innerHeight - dimensions.height },
        onPress: () => {
          setIsDragging(true);
          metricsRef.current.renderCount++;
        },
        onDrag: () => {
          metricsRef.current.renderCount++;
          updateMetrics();
        },
        onDragEnd: () => {
          setIsDragging(false);
          if (windowRef.current) {
            const x = gsap.getProperty(windowRef.current, 'x') as number;
            const y = gsap.getProperty(windowRef.current, 'y') as number;
            setPosition({ x: Math.round(x), y: Math.round(y) });
          }
        },
      });

      draggableRef.current = draggable[0];
      isInitializedRef.current = true;

      return () => {
        draggable[0].kill();
        isInitializedRef.current = false;
      };
    }
  }, [enableDrag, positionStrategy, dimensions, updateMetrics]);

  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: positionStrategy === 'transform' ? initialPosition.x : position.x,
    top: positionStrategy === 'transform' ? initialPosition.y : position.y,
    width: dimensions.width,
    height: dimensions.height,
    transform: positionStrategy === 'transform' ? `translate(${position.x}px, ${position.y}px)` : undefined,
    transition: isDragging || isResizing ? 'none' : 'all 0.2s ease-out',
    willChange: isDragging || isResizing ? 'transform, left, top, width, height' : 'auto',
  };

  const cursorStyle = getCursorForDirection(resizeDirection);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        ref={windowRef}
        style={{
          ...baseStyle,
          cursor: cursorStyle,
        }}
        className="flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-dark-700"
      >
        <div className="flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-4 py-3 dark:bg-dark-300 dark:border-dark-500">
          <div className="flex gap-2">
            <button className="h-3 w-3 rounded-full bg-red-500" aria-label="Close" />
            <button className="h-3 w-3 rounded-full bg-yellow-500" aria-label="Minimize" />
            <button className="h-3 w-3 rounded-full bg-green-500" aria-label="Maximize" />
          </div>
          <span className="text-sm text-gray-400">Sandbox Window ({positionStrategy})</span>
          <div className="w-20" />
        </div>

        <div className="flex flex-1 items-center justify-center p-4">
          <div className="text-center">
            <p className="mb-2 text-lg font-semibold">Position Strategy: {positionStrategy}</p>
            <p className="text-sm text-gray-500">
              Pos: ({Math.round(position.x)}, {Math.round(position.y)})
            </p>
            <p className="text-sm text-gray-500">
              Size: {dimensions.width} x {dimensions.height}
            </p>
            <p className="text-sm text-gray-500">
              {isDragging ? 'Dragging...' : isResizing ? `Resizing: ${activeHandle}` : 'Idle'}
            </p>
          </div>
        </div>

        {enableResize && (
          <>
            <div
              className="absolute left-0 top-2 h-[calc(100%-16px)] w-2 cursor-w-resize"
              style={{ cursor: 'ew-resize' }}
              onPointerDown={handleResizeStart({ N: false, S: false, E: false, W: true, NE: false, NW: false, SE: false, SW: false })}
            />
            <div
              className="absolute right-0 top-2 h-[calc(100%-16px)] w-2 cursor-e-resize"
              style={{ cursor: 'ew-resize' }}
              onPointerDown={handleResizeStart({ N: false, S: false, E: true, W: false, NE: false, NW: false, SE: false, SW: false })}
            />
            <div
              className="absolute bottom-0 left-2 h-2 cursor-s-resize"
              style={{ cursor: 'ns-resize' }}
              onPointerDown={handleResizeStart({ N: false, S: true, E: false, W: false, NE: false, NW: false, SE: false, SW: false })}
            />
            <div
              className="absolute top-0 left-2 h-2 cursor-s-resize"
              style={{ cursor: 'ns-resize' }}
              onPointerDown={handleResizeStart({ N: true, S: false, E: false, W: false, NE: false, NW: false, SE: false, SW: false })}
            />
            <div
              className="absolute bottom-right h-4 w-4 cursor-nwse-resize"
              style={{ cursor: 'nwse-resize' }}
              onPointerDown={handleResizeStart({ N: false, S: true, E: true, W: false, NE: false, NW: false, SE: true, SW: false })}
            />
            <div
              className="absolute bottom-left h-4 w-4 cursor-nesw-resize"
              style={{ cursor: 'nesw-resize' }}
              onPointerDown={handleResizeStart({ N: false, S: true, E: false, W: true, NE: false, NW: false, SE: false, SW: true })}
            />
            <div
              className="absolute top-right h-4 w-4 cursor-nesw-resize"
              style={{ cursor: 'nesw-resize' }}
              onPointerDown={handleResizeStart({ N: true, S: false, E: true, W: false, NE: true, NW: false, SE: false, SW: false })}
            />
            <div
              className="absolute top-left h-4 w-4 cursor-nwse-resize"
              style={{ cursor: 'nwse-resize' }}
              onPointerDown={handleResizeStart({ N: true, S: false, E: false, W: true, NE: false, NW: true, SE: false, SW: false })}
            />
          </>
        )}

        {showMetrics && (
          <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-green-400 font-mono">
            FPS: {metrics.fps} | RAF: {metrics.rafCount} | Renders: {metrics.renderCount}
          </div>
        )}
      </div>
    </div>
  );
}

export default WindowSandbox;
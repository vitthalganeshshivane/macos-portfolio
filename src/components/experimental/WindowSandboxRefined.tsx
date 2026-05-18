import { useRef, useState, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface ResizeConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

interface ResizeDirection {
  N: boolean;
  S: boolean;
  E: boolean;
  W: boolean;
}

interface ResizeMetrics {
  fps: number;
  lastTime: number;
  frameCount: number;
}

interface RefinedSandboxProps {
  initialPosition?: Position;
  initialDimensions?: Dimensions;
  constraints?: ResizeConstraints;
  showMetrics?: boolean;
}

const DEFAULT_CONSTRAINTS: ResizeConstraints = {
  minWidth: 320,
  minHeight: 240,
  maxWidth: window.innerWidth * 0.85,
  maxHeight: window.innerHeight * 0.85,
};

export function WindowSandboxRefined({
  initialPosition = { x: 200, y: 150 },
  initialDimensions = { width: 480, height: 360 },
  constraints = DEFAULT_CONSTRAINTS,
  showMetrics = false,
}: RefinedSandboxProps): JSX.Element {
  const windowElRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<Position>(initialPosition);
  const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions);

  const stateRef = useRef({
    isResizing: false,
    isDragging: false,
    resizeDirection: null as ResizeDirection | null,
    resizeStart: { mouse: { x: 0, y: 0 }, pos: { x: 0, y: 0 }, dim: { width: 0, height: 0 } },
    dragStart: { mouse: { x: 0, y: 0 }, pos: { x: 0, y: 0 } },
    rafId: 0,
    pendingUpdate: false,
  });

  const metricsRef = useRef<ResizeMetrics>({
    fps: 60,
    lastTime: performance.now(),
    frameCount: 0,
  });

  const rafRef = useRef<number | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [metrics, setMetrics] = useState({ fps: 60, renders: 0 });
  const renderCountRef = useRef(0);

  useEffect(() => {
    if (!showMetrics) return;
    const interval = setInterval(() => {
      const m = metricsRef.current;
      const fps = Math.round((m.frameCount * 1000) / (performance.now() - m.lastTime));
      m.frameCount = 0;
      m.lastTime = performance.now();
      setMetrics((prev) => ({ ...prev, fps }));
    }, 500);
    return () => clearInterval(interval);
  }, [showMetrics]);

  const getDirectionFromCursor = useCallback((e: PointerEvent, rect: DOMRect): ResizeDirection | null => {
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    const EDGE_THRESHOLD = 12;
    const CORNER_SIZE = 20;

    const onLeft = x < EDGE_THRESHOLD;
    const onRight = x > w - EDGE_THRESHOLD;
    const onTop = y < EDGE_THRESHOLD;
    const onBottom = y > h - EDGE_THRESHOLD;

    const onCornerTL = x < CORNER_SIZE && y < CORNER_SIZE;
    const onCornerTR = x > w - CORNER_SIZE && y < CORNER_SIZE;
    const onCornerBL = x < CORNER_SIZE && y > h - CORNER_SIZE;
    const onCornerBR = x > w - CORNER_SIZE && y > h - CORNER_SIZE;

    if (onCornerTL) return { N: true, W: true };
    if (onCornerTR) return { N: true, E: true };
    if (onCornerBL) return { S: true, W: true };
    if (onCornerBR) return { S: true, E: true };
    if (onTop) return { N: true };
    if (onBottom) return { S: true };
    if (onLeft) return { W: true };
    if (onRight) return { E: true };

    return null;
  }, []);

  const applyResizeDirect = useCallback((deltaX: number, deltaY: number) => {
    const state = stateRef.current;
    if (!state.isResizing || !state.resizeDirection) return;

    const { resizeDirection: dir, resizeStart } = state;
    const { width: startW, height: startH } = resizeStart.dim;
    const { x: startX, y: startY } = resizeStart.pos;

    let newW = startW;
    let newH = startH;
    let newX = startX;
    let newY = startY;

    if (dir.E) newW = startW + deltaX;
    if (dir.W) {
      newW = startW - deltaX;
      newX = startX + deltaX;
    }
    if (dir.S) newH = startH + deltaY;
    if (dir.N) {
      newH = startH - deltaY;
      newY = startY + deltaY;
    }

    newW = Math.round(Math.max(constraints.minWidth, Math.min(constraints.maxWidth, newW)));
    newH = Math.round(Math.max(constraints.minHeight, Math.min(constraints.maxHeight, newH)));

    if (dir.W) newX = startX + (startW - newW);
    if (dir.N) newY = startY + (startH - newH);

    const win = windowElRef.current;
    if (win) {
      win.style.left = `${newX}px`;
      win.style.top = `${newY}px`;
      win.style.width = `${newW}px`;
      win.style.height = `${newH}px`;
    }

    renderCountRef.current++;
    metricsRef.current.frameCount++;
  }, [constraints]);

  const applyDragDirect = useCallback((deltaX: number, deltaY: number) => {
    const state = stateRef.current;
    if (!state.isDragging) return;

    const { dragStart } = state;
    const newX = dragStart.pos.x + deltaX;
    const newY = dragStart.pos.y + deltaY;

    const win = windowElRef.current;
    if (win) {
      win.style.left = `${newX}px`;
      win.style.top = `${newY}px`;
    }

    renderCountRef.current++;
    metricsRef.current.frameCount++;
  }, []);

  const scheduleFrame = useCallback((callback: () => void) => {
    const state = stateRef.current;
    if (state.pendingUpdate) return;

    state.pendingUpdate = true;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      state.pendingUpdate = false;
      callback();
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const win = windowElRef.current;
    if (!win) return;

    const rect = win.getBoundingClientRect();
    const state = stateRef.current;

    const header = win.querySelector('.window-header') as HTMLElement;
    const isOnHeader = header && e.target instanceof Node && header.contains(e.target);

    if (isOnHeader) {
      e.preventDefault();
      state.isDragging = true;
      state.dragStart = {
        mouse: { x: e.clientX, y: e.clientY },
        pos: { x: position.x, y: position.y },
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      win.style.cursor = 'grabbing';
      return;
    }

    const direction = getDirectionFromCursor(e, rect);
    if (direction) {
      e.preventDefault();
      e.stopPropagation();

      state.isResizing = true;
      state.resizeDirection = direction;
      state.resizeStart = {
        mouse: { x: e.clientX, y: e.clientY },
        pos: { x: position.x, y: position.y },
        dim: { width: dimensions.width, height: dimensions.height },
      };

      win.style.cursor = getCursorForDir(direction);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [position, dimensions, getDirectionFromCursor]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const state = stateRef.current;
    const win = windowElRef.current;

    if (!win) return;

    if (state.isResizing) {
      const deltaX = e.clientX - state.resizeStart.mouse.x;
      const deltaY = e.clientY - state.resizeStart.mouse.y;
      scheduleFrame(() => applyResizeDirect(deltaX, deltaY));
    } else if (state.isDragging) {
      const deltaX = e.clientX - state.dragStart.mouse.x;
      const deltaY = e.clientY - state.dragStart.mouse.y;
      scheduleFrame(() => applyDragDirect(deltaX, deltaY));
    } else {
      const rect = win.getBoundingClientRect();
      const direction = getDirectionFromCursor(e, rect);
      win.style.cursor = direction ? getCursorForDir(direction) : 'default';
    }
  }, [getDirectionFromCursor, scheduleFrame, applyResizeDirect, applyDragDirect]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const state = stateRef.current;
    const win = windowElRef.current;

    if (!win) return;

    if (state.isResizing && state.resizeDirection) {
      const deltaX = e.clientX - state.resizeStart.mouse.x;
      const deltaY = e.clientY - state.resizeStart.mouse.y;

      const dir = state.resizeDirection;
      const start = state.resizeStart;
      let newW = start.dim.width;
      let newH = start.dim.height;
      let newX = start.pos.x;
      let newY = start.pos.y;

      if (dir.E) newW = start.dim.width + deltaX;
      if (dir.W) {
        newW = start.dim.width - deltaX;
        newX = start.pos.x + deltaX;
      }
      if (dir.S) newH = start.dim.height + deltaY;
      if (dir.N) {
        newH = start.dim.height - deltaY;
        newY = start.pos.y + deltaY;
      }

      newW = Math.round(Math.max(constraints.minWidth, Math.min(constraints.maxWidth, newW)));
      newH = Math.round(Math.max(constraints.minHeight, Math.min(constraints.maxHeight, newH)));

      if (dir.W) newX = start.pos.x + (start.dim.width - newW);
      if (dir.N) newY = start.pos.y + (start.dim.height - newH);

      setPosition({ x: newX, y: newY });
      setDimensions({ width: newW, height: newH });
    } else if (state.isDragging) {
      const deltaX = e.clientX - state.dragStart.mouse.x;
      const deltaY = e.clientY - state.dragStart.mouse.y;
      const newX = Math.round(state.dragStart.pos.x + deltaX);
      const newY = Math.round(state.dragStart.pos.y + deltaY);
      setPosition({ x: newX, y: newY });
    }

    state.isResizing = false;
    state.isDragging = false;
    state.resizeDirection = null;

    win.style.cursor = 'default';

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, [constraints]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        ref={windowElRef}
        onPointerDown={handlePointerDown}
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          width: dimensions.width,
          height: dimensions.height,
          cursor: 'default',
          userSelect: 'none',
        }}
        className="flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/5"
      >
        <div className="window-header flex items-center justify-between select-none">
          <div className="flex gap-2">
            <button className="h-3 w-3 rounded-full bg-red-400 hover:bg-red-500" aria-label="Close" />
            <button className="h-3 w-3 rounded-full bg-yellow-400 hover:bg-yellow-500" aria-label="Minimize" />
            <button className="h-3 w-3 rounded-full bg-green-400 hover:bg-green-500" aria-label="Maximize" />
          </div>
          <span className="text-xs text-gray-400">Refined Resize</span>
          <div className="w-14" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">{dimensions.width} × {dimensions.height}</p>
            <p className="text-xs text-gray-400 mt-1">({position.x}, {position.y})</p>
          </div>
        </div>

        {showMetrics && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-green-400 text-xs px-2 py-1 rounded font-mono">
            FPS: {metrics.fps} | Renders: {renderCountRef.current}
          </div>
        )}
      </div>
    </div>
  );
}

function getCursorForDir(dir: ResizeDirection): string {
  const { N, S, E, W } = dir;
  if ((N && W) || (S && E)) return 'nwse-resize';
  if ((N && E) || (S && W)) return 'nesw-resize';
  if (N || S) return 'ns-resize';
  if (E || W) return 'ew-resize';
  return 'default';
}

export default WindowSandboxRefined;
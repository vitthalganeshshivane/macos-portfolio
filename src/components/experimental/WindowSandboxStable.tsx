import { useRef, useState, useEffect, useCallback, useMemo } from 'react';

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

interface PolishedSandboxProps {
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

const EDGE_SIZE = 14;
const CORNER_SIZE = 22;

export function WindowSandboxStable({
  initialPosition = { x: 200, y: 150 },
  initialDimensions = { width: 480, height: 360 },
  constraints = DEFAULT_CONSTRAINTS,
  showMetrics = false,
}: PolishedSandboxProps): JSX.Element {
  const windowElRef = useRef<HTMLDivElement>(null);
  const rectCacheRef = useRef<DOMRect | null>(null);
  const rectCacheTimeRef = useRef(0);

  const [position, setPosition] = useState<Position>(initialPosition);
  const [dimensions, setDimensions] = useState<Dimensions>(initialDimensions);
  const [isActive, setIsActive] = useState(false);

  const stateRef = useRef({
    isResizing: false,
    isDragging: false,
    resizeDirection: null as ResizeDirection | null,
    resizeStart: { mouse: { x: 0, y: 0 }, pos: { x: 0, y: 0 }, dim: { width: 0, height: 0 } },
    dragStart: { mouse: { x: 0, y: 0 }, pos: { x: 0, y: 0 } },
    rafId: 0,
    pendingUpdate: false,
  });

  const rafRef = useRef<number | null>(null);
  const lastPositionRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  const [metrics, setMetrics] = useState({ fps: 60, renders: 0 });
  const renderCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const frameCountRef = useRef(0);

  useEffect(() => {
    if (!showMetrics) return;
    let animationId: number;
    const updateMetrics = () => {
      const now = performance.now();
      frameCountRef.current++;
      if (now - lastFrameTimeRef.current >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / (now - lastFrameTimeRef.current));
        setMetrics({ fps, renders: renderCountRef.current });
        frameCountRef.current = 0;
        lastFrameTimeRef.current = now;
      }
      animationId = requestAnimationFrame(updateMetrics);
    };
    animationId = requestAnimationFrame(updateMetrics);
    return () => cancelAnimationFrame(animationId);
  }, [showMetrics]);

  const getCachedRect = useCallback((): DOMRect | null => {
    const win = windowElRef.current;
    if (!win) return null;

    const now = performance.now();
    if (rectCacheRef.current && now - rectCacheTimeRef.current < 16) {
      return rectCacheRef.current;
    }

    rectCacheRef.current = win.getBoundingClientRect();
    rectCacheTimeRef.current = now;
    return rectCacheRef.current;
  }, []);

  const getDirectionFromCursor = useCallback((x: number, y: number, w: number, h: number): ResizeDirection | null => {
    const onLeft = x < EDGE_SIZE;
    const onRight = x > w - EDGE_SIZE;
    const onTop = y < EDGE_SIZE;
    const onBottom = y > h - EDGE_SIZE;

    const onTL = x < CORNER_SIZE && y < CORNER_SIZE;
    const onTR = x > w - CORNER_SIZE && y < CORNER_SIZE;
    const onBL = x < CORNER_SIZE && y > h - CORNER_SIZE;
    const onBR = x > w - CORNER_SIZE && y > h - CORNER_SIZE;

    if (onTL) return { N: true, W: true };
    if (onTR) return { N: true, E: true };
    if (onBL) return { S: true, W: true };
    if (onBR) return { S: true, E: true };
    if (onTop) return { N: true };
    if (onBottom) return { S: true };
    if (onLeft) return { W: true };
    if (onRight) return { E: true };

    return null;
  }, []);

  const getCursorForDir = useCallback((dir: ResizeDirection | null): string => {
    if (!dir) return 'default';
    const { N, S, E, W } = dir;
    if ((N && W) || (S && E)) return 'nwse-resize';
    if ((N && E) || (S && W)) return 'nesw-resize';
    if (N || S) return 'ns-resize';
    if (E || W) return 'ew-resize';
    return 'default';
  }, []);

  const applyResizeDirect = useCallback((deltaX: number, deltaY: number) => {
    const state = stateRef.current;
    if (!state.isResizing || !state.resizeDirection) return;

    const dir = state.resizeDirection;
    const start = state.resizeStart;

    let newW = start.dim.width;
    let newH = start.dim.height;
    let newX = start.pos.x;
    let newY = start.pos.y;

    const MIN_SNAP = 5;
    const isNearMinW = dir.W && Math.abs(start.dim.width - constraints.minWidth) < MIN_SNAP;
    const isNearMinH = dir.N && Math.abs(start.dim.height - constraints.minHeight) < MIN_SNAP;

    if (dir.E && !isNearMinW) newW = start.dim.width + deltaX;
    if (dir.W && !isNearMinW) {
      newW = start.dim.width - deltaX;
      newX = start.pos.x + deltaX;
    }
    if (dir.S) newH = start.dim.height + deltaY;
    if (dir.N && !isNearMinH) {
      newH = start.dim.height - deltaY;
      newY = start.pos.y + deltaY;
    }

    newW = Math.round(Math.max(constraints.minWidth, Math.min(constraints.maxWidth, newW)));
    newH = Math.round(Math.max(constraints.minHeight, Math.min(constraints.maxHeight, newH)));

    if (dir.W) newX = start.pos.x + (start.dim.width - newW);
    if (dir.N) newY = start.pos.y + (start.dim.height - newH);

    const win = windowElRef.current;
    if (win) {
      win.style.left = `${newX}px`;
      win.style.top = `${newY}px`;
      win.style.width = `${newW}px`;
      win.style.height = `${newH}px`;
      lastPositionRef.current = { x: newX, y: newY, w: newW, h: newH };
    }

    renderCountRef.current++;
  }, [constraints]);

  const applyDragDirect = useCallback((deltaX: number, deltaY: number) => {
    const state = stateRef.current;
    if (!state.isDragging) return;

    const { dragStart } = state;
    const boundsW = window.innerWidth - dimensions.width;
    const boundsH = window.innerHeight - dimensions.height;

    const newX = Math.max(0, Math.min(boundsW, dragStart.pos.x + deltaX));
    const newY = Math.max(0, Math.min(boundsH, dragStart.pos.y + deltaY));

    const win = windowElRef.current;
    if (win) {
      win.style.left = `${newX}px`;
      win.style.top = `${newY}px`;
      lastPositionRef.current = { ...lastPositionRef.current, x: newX, y: newY };
    }

    renderCountRef.current++;
  }, [dimensions]);

  const scheduleFrame = useCallback((callback: () => void) => {
    const state = stateRef.current;
    if (state.pendingUpdate) return;

    state.pendingUpdate = true;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      state.pendingUpdate = false;
      callback();
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const win = windowElRef.current;
    if (!win) return;

    const rect = getCachedRect();
    if (!rect) return;

    const state = stateRef.current;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const header = win.querySelector('.window-header') as HTMLElement;
    const isOnHeader = header && e.target instanceof Node && header.contains(e.target);

    if (isOnHeader) {
      e.preventDefault();
      state.isDragging = true;
      state.dragStart = {
        mouse: { x: e.clientX, y: e.clientY },
        pos: { x: position.x, y: position.y },
      };
      win.setPointerCapture(e.pointerId);
      win.style.cursor = 'grabbing';
      setIsActive(true);
      return;
    }

    const direction = getDirectionFromCursor(mouseX, mouseY, rect.width, rect.height);
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
      win.style.setProperty('cursor', getCursorForDir(direction), 'important');
      win.setPointerCapture(e.pointerId);
      setIsActive(true);
    }
  }, [position, dimensions, getCachedRect, getDirectionFromCursor, getCursorForDir]);

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
      const rect = getCachedRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const direction = getDirectionFromCursor(mouseX, mouseY, rect.width, rect.height);
        win.style.cursor = getCursorForDir(direction);
      }
    }
  }, [getCachedRect, getDirectionFromCursor, getCursorForDir, scheduleFrame, applyResizeDirect, applyDragDirect]);

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
      lastPositionRef.current = { x: newX, y: newY, w: newW, h: newH };
    } else if (state.isDragging) {
      const deltaX = e.clientX - state.dragStart.mouse.x;
      const deltaY = e.clientY - state.dragStart.mouse.y;
      const boundsW = window.innerWidth - dimensions.width;
      const boundsH = window.innerHeight - dimensions.height;
      const newX = Math.max(0, Math.min(boundsW, Math.round(state.dragStart.pos.x + deltaX)));
      const newY = Math.max(0, Math.min(boundsH, Math.round(state.dragStart.pos.y + deltaY)));
      setPosition({ x: newX, y: newY });
      lastPositionRef.current = { ...lastPositionRef.current, x: newX, y: newY };
    }

    state.isResizing = false;
    state.isDragging = false;
    state.resizeDirection = null;

    win.style.cursor = 'default';
    setIsActive(false);

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    win.releasePointerCapture(e.pointerId);
  }, [constraints, dimensions]);

  const handlePointerLeave = useCallback((e: React.PointerEvent) => {
    const state = stateRef.current;
    const win = windowElRef.current;

    if (!win) return;

    if (!state.isDragging && !state.isResizing) {
      win.style.cursor = 'default';
    }
  }, []);

  useEffect(() => {
    lastPositionRef.current = { x: initialPosition.x, y: initialPosition.y, w: initialDimensions.width, h: initialDimensions.height };
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        ref={windowElRef}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        style={{
          position: 'absolute',
          left: lastPositionRef.current.x || position.x,
          top: lastPositionRef.current.y || position.y,
          width: lastPositionRef.current.w || dimensions.width,
          height: lastPositionRef.current.h || dimensions.height,
          cursor: 'default',
          userSelect: 'none',
          touchAction: 'none',
        }}
        className={`flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/5 transition-all duration-100 ${
          isActive ? 'ring-2 ring-blue-400/50' : ''
        }`}
      >
        <div
          className="window-header flex items-center justify-between select-none"
          style={{ cursor: 'grab' }}
        >
          <div className="flex gap-2">
            <button className="h-3 w-3 rounded-full bg-red-400 hover:bg-red-500" aria-label="Close" />
            <button className="h-3 w-3 rounded-full bg-yellow-400 hover:bg-yellow-500" aria-label="Minimize" />
            <button className="h-3 w-3 rounded-full bg-green-400 hover:bg-green-500" aria-label="Maximize" />
          </div>
          <span className="text-xs text-gray-400">Stable Resize</span>
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

export default WindowSandboxStable;
export interface Position {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ResizeConstraints {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

export interface ResizeDirection {
  N?: boolean;
  S?: boolean;
  E?: boolean;
  W?: boolean;
}

export interface ResizeState {
  pos: Position;
  dim: Dimensions;
  mouse: Position;
}

export interface ResizeResult {
  pos: Position;
  dim: Dimensions;
  isAtBoundary: boolean;
}

const EDGE_SIZE = 14;
const CORNER_SIZE = 22;

export const DESKTOP_NAVBAR_HEIGHT = 40;

export function getDirectionFromPosition(
  clientX: number,
  clientY: number,
  rect: DOMRect
): ResizeDirection | null {
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  const w = rect.width;
  const h = rect.height;

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
}

export function getCursorForDirection(dir: ResizeDirection | null): string {
  if (!dir) return 'default';
  const { N, S, E, W } = dir;
  if ((N && W) || (S && E)) return 'nwse-resize';
  if ((N && E) || (S && W)) return 'nesw-resize';
  if (N || S) return 'ns-resize';
  if (E || W) return 'ew-resize';
  return 'default';
}

export function calculateResize(
  direction: ResizeDirection,
  startState: ResizeState,
  deltaX: number,
  deltaY: number,
  constraints: ResizeConstraints
): ResizeResult {
  const { pos, dim } = startState;
  const { width: startW, height: startH } = dim;
  const { x: startX, y: startY } = pos;

  let newW = startW;
  let newH = startH;
  let newX = startX;
  let newY = startY;

  const MIN_SNAP = 5;
  const isNearMinW = direction.W && Math.abs(startW - constraints.minWidth) < MIN_SNAP;
  const isNearMinH = direction.N && Math.abs(startH - constraints.minHeight) < MIN_SNAP;

  if (direction.E && !isNearMinW) {
    newW = startW + deltaX;
  }
  if (direction.W && !isNearMinW) {
    newW = startW - deltaX;
    newX = startX + deltaX;
  }
  if (direction.S) {
    newH = startH + deltaY;
  }
  if (direction.N && !isNearMinH) {
    newH = startH - deltaY;
    newY = startY + deltaY;
  }

  newW = Math.round(Math.max(constraints.minWidth, Math.min(constraints.maxWidth, newW)));
  newH = Math.round(Math.max(constraints.minHeight, Math.min(constraints.maxHeight, newH)));

  if (direction.W) newX = startX + (startW - newW);
  if (direction.N) newY = startY + (startH - newH);

  if (direction.N && newY < DESKTOP_NAVBAR_HEIGHT) {
    const bottomEdge = startY + startH;
    newY = DESKTOP_NAVBAR_HEIGHT;
    newH = Math.max(constraints.minHeight, bottomEdge - DESKTOP_NAVBAR_HEIGHT);
  }

  const isAtBoundary =
    newW === constraints.minWidth ||
    newW === constraints.maxWidth ||
    newH === constraints.minHeight ||
    newH === constraints.maxHeight;

  return {
    pos: { x: newX, y: newY },
    dim: { width: newW, height: newH },
    isAtBoundary,
  };
}

export function calculateDrag(
  startPos: Position,
  startMouse: Position,
  currentMouse: Position,
  bounds: { maxX: number; maxY: number }
): Position {
  const deltaX = currentMouse.x - startMouse.x;
  const deltaY = currentMouse.y - startMouse.y;

  const newX = Math.max(0, Math.min(bounds.maxX, startPos.x + deltaX));
  const newY = Math.max(DESKTOP_NAVBAR_HEIGHT, Math.min(bounds.maxY, startPos.y + deltaY));

  return { x: Math.round(newX), y: Math.round(newY) };
}

export function applyResizeToElement(
  element: HTMLElement,
  result: ResizeResult
): void {
  element.style.left = `${result.pos.x}px`;
  element.style.top = `${result.pos.y}px`;
  element.style.width = `${result.dim.width}px`;
  element.style.height = `${result.dim.height}px`;
}

export function applyDragToElement(
  element: HTMLElement,
  pos: Position
): void {
  element.style.left = `${pos.x}px`;
  element.style.top = `${pos.y}px`;
}
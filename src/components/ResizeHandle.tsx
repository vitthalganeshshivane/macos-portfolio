import type { ReactElement } from 'react';
import type { ResizeDirection } from '#lib/resize-engine';

interface ResizeHandleProps {
  direction: ResizeDirection;
  onResizeStart: (direction: ResizeDirection) => (e: React.PointerEvent) => void;
}

export function ResizeHandle({ direction, onResizeStart }: ResizeHandleProps): ReactElement {
  const isN = direction.N && !direction.E && !direction.W;
  const isS = direction.S && !direction.E && !direction.W;
  const isE = direction.E && !direction.N && !direction.S;
  const isW = direction.W && !direction.N && !direction.S;
  const isCorner = (direction.N || direction.S) && (direction.E || direction.W);

  const classes = [
    'absolute',
    isN && 'top-0 left-2 right-2 h-1 cursor-ns-resize',
    isS && 'bottom-0 left-2 right-2 h-1 cursor-ns-resize',
    isE && 'right-0 top-2 bottom-2 w-1 cursor-ew-resize',
    isW && 'left-0 top-2 bottom-2 w-1 cursor-ew-resize',
    isCorner && 'w-3 h-3',
    isCorner && direction.N && direction.W && 'top-0 left-0 cursor-nwse-resize',
    isCorner && direction.N && direction.E && 'top-0 right-0 cursor-nesw-resize',
    isCorner && direction.S && direction.W && 'bottom-0 left-0 cursor-nesw-resize',
    isCorner && direction.S && direction.E && 'bottom-0 right-0 cursor-nwse-resize',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onPointerDown={onResizeStart(direction)}
      style={{ touchAction: 'none' }}
    />
  );
}

export default ResizeHandle;
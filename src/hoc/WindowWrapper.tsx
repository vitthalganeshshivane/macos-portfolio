import { Draggable, gsap } from '#lib/gsap-draggable';
import { useWindowStore, type WindowState } from '#store';
import type { WindowKey } from '#types';
import {
	calculateResize,
	calculateDrag,
	applyResizeToElement,
	applyDragToElement,
	getDirectionFromPosition,
	getCursorForDirection,
	type ResizeDirection,
	type ResizeState,
} from '#lib/resize-engine';
import { ResizeHandle } from '#components/ResizeHandle';
import { useGSAP } from '@gsap/react';
import type { ComponentType, ReactElement, JSX as ReactJSX } from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

const WINDOW_MIN_SIZE: Record<string, { minWidth: number; minHeight: number }> = {
	finder: { minWidth: 400, minHeight: 300 },
	safari: { minWidth: 600, minHeight: 400 },
	terminal: { minWidth: 350, minHeight: 250 },
	contact: { minWidth: 300, minHeight: 350 },
	resume: { minWidth: 400, minHeight: 500 },
	photos: { minWidth: 400, minHeight: 300 },
	veronica: { minWidth: 350, minHeight: 400 },
	txtfile: { minWidth: 300, minHeight: 200 },
	imgfile: { minWidth: 300, minHeight: 250 },
};

const getWindowConstraints = (key: string) => {
	const defaults = { minWidth: 300, minHeight: 200 };
	const windowDefaults = WINDOW_MIN_SIZE[key] ?? defaults;
	return {
		...windowDefaults,
		maxWidth: window.innerWidth * 0.9,
		maxHeight: window.innerHeight * 0.9,
	};
};

const WindowWrapper = <Props extends ReactJSX.IntrinsicAttributes>(
	Component: ComponentType<Props>,
	windowKey: WindowKey,
): ComponentType<Props> => {
	const Wrapped = (props: Props): ReactElement | null => {
		const windows = useWindowStore((state: WindowState) => state.windows);
		const focusWindow = useWindowStore((state: WindowState) => state.focusWindow);
		const { isOpen, zIndex, position, size, isMaximized } = windows[windowKey];
		const ref = useRef<HTMLElement | null>(null);
		const [isDesktop, setIsDesktop] = useState<boolean>(() =>
			typeof window !== 'undefined'
				? window.matchMedia('(min-width: 640px)').matches
				: true,
		);

		const stateRef = useRef({
			isResizing: false,
			resizeDirection: null as ResizeDirection | null,
			resizeStart: null as ResizeState | null,
			dragStartMouse: { x: 0, y: 0 },
			dragStartPos: { x: 0, y: 0 },
			pendingUpdate: false,
			rafId: 0 as number,
		});

		const rafRef = useRef<number | null>(null);
		const lastPosRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

		useEffect(() => {
			const media = window.matchMedia('(min-width: 640px)');
			const sync = () => {
				setIsDesktop(media.matches);
			};

			sync();
			media.addEventListener('change', sync);
			return () => {
				media.removeEventListener('change', sync);
			};
		}, []);

		useGSAP(() => {
			const el = ref.current;
			if (!el || !isOpen || !isDesktop) return;

			gsap.fromTo(
				el,
				{ scale: 0.8, opacity: 0, y: 40 },
				{
					scale: 1,
					opacity: 1,
					y: 0,
					duration: 0.4,
					ease: 'power3.out',
				},
			);
		}, [isDesktop, isOpen]);

		useGSAP(() => {
			const el = ref.current;
			if (!el || !isOpen || !isDesktop) return;
			const headerTrigger = el.querySelector<HTMLElement>('.window-header');

			const draggableOptions = {
				trigger: headerTrigger ?? el,
				dragClickables: false,
				allowEventDefault: true,
				type: 'x,y',
				onPress: () => {
					focusWindow(windowKey);
				},
				onDrag: function() {
					const y = this.y;
					const minY = 0;
					if (y < minY) {
						this.y = minY;
						this.update();
					}
				},
			} as unknown as Parameters<typeof Draggable.create>[1];

			const [instance] = Draggable.create(el, draggableOptions);

			return () => {
				instance.kill();
			};
		}, [focusWindow, isDesktop, isOpen, windowKey]);

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

		const handleResizeStart = useCallback(
			(direction: ResizeDirection) => (e: React.PointerEvent) => {
				const win = ref.current;
				if (!win) return;

				e.preventDefault();
				e.stopPropagation();

				const rect = win.getBoundingClientRect();
				const state = stateRef.current;

				state.isResizing = true;
				state.resizeDirection = direction;
				state.resizeStart = {
					pos: { x: position?.x ?? 0, y: position?.y ?? 0 },
					dim: { width: size?.width ?? 400, height: size?.height ?? 300 },
					mouse: { x: e.clientX, y: e.clientY },
				};

				focusWindow(windowKey);
				win.style.cursor = getCursorForDirection(direction);
				win.setPointerCapture(e.pointerId);
			},
			[position, size, focusWindow, windowKey],
		);

		const handlePointerMove = useCallback(
			(e: React.PointerEvent) => {
				const win = ref.current;
				if (!win) return;

				const state = stateRef.current;

				if (isMaximized) return;

				if (state.isResizing && state.resizeDirection && state.resizeStart) {
					const deltaX = e.clientX - state.resizeStart.mouse.x;
					const deltaY = e.clientY - state.resizeStart.mouse.y;
					const constraints = getWindowConstraints(windowKey);

					scheduleFrame(() => {
						const result = calculateResize(
							state.resizeDirection!,
							state.resizeStart!,
							deltaX,
							deltaY,
							constraints,
						);
						applyResizeToElement(win, result);
						lastPosRef.current = { x: result.pos.x, y: result.pos.y, w: result.dim.width, h: result.dim.height };
					});
				} else {
					const rect = win.getBoundingClientRect();
					const direction = getDirectionFromPosition(e.clientX, e.clientY, rect);
					win.style.cursor = direction ? getCursorForDirection(direction) : 'default';
				}
			},
			[windowKey, scheduleFrame],
		);

		const handlePointerUp = useCallback(
			(e: React.PointerEvent) => {
				const win = ref.current;
				if (!win) return;

				const state = stateRef.current;
				const constraints = getWindowConstraints(windowKey);

				if (state.isResizing && state.resizeDirection && state.resizeStart) {
					const deltaX = e.clientX - state.resizeStart.mouse.x;
					const deltaY = e.clientY - state.resizeStart.mouse.y;

					const result = calculateResize(
						state.resizeDirection,
						state.resizeStart,
						deltaX,
						deltaY,
						constraints,
					);

					const setWindowPosition = useWindowStore.getState().setWindowPosition;
					const setWindowSize = useWindowStore.getState().setWindowSize;

					setWindowPosition(windowKey, result.pos);
					setWindowSize(windowKey, result.dim);
				}

				state.isResizing = false;
				state.resizeDirection = null;
				state.resizeStart = null;

				win.style.cursor = 'default';

				if (rafRef.current) {
					cancelAnimationFrame(rafRef.current);
					rafRef.current = null;
				}

				win.releasePointerCapture(e.pointerId);
			},
			[windowKey],
		);

		useEffect(() => {
			return () => {
				if (rafRef.current) {
					cancelAnimationFrame(rafRef.current);
				}
			};
		}, []);

		if (!isDesktop) return null;

		const resizeDirections: ResizeDirection[] = [
			{ N: true, S: false, E: false, W: false },
			{ N: false, S: true, E: false, W: false },
			{ N: false, S: false, E: true, W: false },
			{ N: false, S: false, E: false, W: true },
			{ N: true, S: false, E: true, W: false },
			{ N: true, S: false, E: false, W: true },
			{ N: false, S: true, E: true, W: false },
			{ N: false, S: true, E: false, W: true },
		];

		return (
			<section
				id={windowKey}
				ref={ref}
				onPointerDown={() => {
					focusWindow(windowKey);
				}}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				style={{
					zIndex,
					display: isOpen ? undefined : 'none',
					left: position?.x ?? undefined,
					top: position?.y ?? undefined,
					width: size?.width ?? undefined,
					height: size?.height ?? undefined,
				}}
				className={`desktop-window absolute ${isMaximized ? 'maximized' : ''}`}
			>
				{!isMaximized && resizeDirections.map((dir, i) => (
					<ResizeHandle key={i} direction={dir} onResizeStart={handleResizeStart} />
				))}
				<Component {...props} />
			</section>
		);
	};

	const componentName = Component.displayName ?? Component.name;
	Wrapped.displayName = `windowWrapper(${componentName})`;

	return Wrapped;
};

export default WindowWrapper;
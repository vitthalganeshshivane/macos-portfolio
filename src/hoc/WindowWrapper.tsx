import { Draggable, gsap } from '#lib/gsap-draggable';
import { useWindowStore, type WindowState } from '#store';
import type { WindowKey } from '#types';
import {
	calculateResize,
	applyResizeToElement,
	getDirectionFromPosition,
	getCursorForDirection,
	DESKTOP_NAVBAR_HEIGHT,
	type ResizeDirection,
	type ResizeState,
} from '#lib/resize-engine';
import { ResizeHandle } from '#components/ResizeHandle';
import { useGSAP } from '@gsap/react';
import type { ComponentType, ReactElement, JSX as ReactJSX } from 'react';
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';

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

const applyWindowStyle = (el: HTMLElement, pos: { x: number; y: number }, sz: { width: number; height: number }) => {
	el.style.left = `${pos.x}px`;
	el.style.top = `${pos.y}px`;
	el.style.width = `${sz.width}px`;
	el.style.height = `${sz.height}px`;
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
		});

		const isMaximizedRef = useRef(isMaximized);
		isMaximizedRef.current = isMaximized;

		const rafRef = useRef<number | null>(null);
		const rafPendingRef = useRef(false);
		const latestDeltaRef = useRef({ x: 0, y: 0 });
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

		useLayoutEffect(() => {
			const el = ref.current;
			if (!el || !isOpen) return;
			const beforeTop = el.style.top;
			if (!stateRef.current.isResizing) {
				const p = position ?? { x: 0, y: 0 };
				const s = size ?? { width: 400, height: 300 };
				console.log('LAYOUT_BEFORE', { windowKey, storePos: p, styleTop: beforeTop });
				applyWindowStyle(el, p, s);
				console.log('LAYOUT_AFTER', { windowKey, styleTop: el.style.top });
				lastPosRef.current = { x: p.x, y: p.y, w: s.width, h: s.height };
			}
		}, [position, size, isOpen]);

		useGSAP(() => {
			const el = ref.current;
			if (!el || !isOpen || !isDesktop) return;

			gsap.set(el, { x: 0, y: 0, clearProps: 'transform' });

			console.log("WINDOW_OPEN", {
				windowKey,
				storePosition: position,
				styleTop: el.style.top,
				styleLeft: el.style.left,
				computedTop: getComputedStyle(el).top,
				computedTransform: getComputedStyle(el).transform,
				boundingRect: el.getBoundingClientRect(),
			});
			let node = el.parentElement;
			while (node) {
				const cs = getComputedStyle(node);
				console.log('PARENT', {
					element: node.className || node.id || node.tagName,
					position: cs.position,
					transform: cs.transform,
					overflow: cs.overflow,
					top: cs.top,
					left: cs.left,
				});
				node = node.parentElement;
			}

			gsap.fromTo(
				el,
				{ opacity: 0, scale: 0.92 },
				{
					opacity: 1,
					scale: 1,
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
				onDrag: function(this: any) {
					const y = this.y;
					console.log('DRAG', { windowKey, clientY: y, cssTop: el.style.top });
					if (y < DESKTOP_NAVBAR_HEIGHT) {
						this.y = DESKTOP_NAVBAR_HEIGHT;
						this.update();
					}
				},
			} as unknown as Parameters<typeof Draggable.create>[1];

			const [instance] = Draggable.create(el, draggableOptions);

			return () => {
				instance.kill();
			};
		}, [focusWindow, isDesktop, isOpen, windowKey]);

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
					pos: { x: rect.left, y: rect.top },
					dim: { width: rect.width, height: rect.height },
					mouse: { x: e.clientX, y: e.clientY },
				};

				focusWindow(windowKey);
				win.style.cursor = getCursorForDirection(direction);
				win.setPointerCapture(e.pointerId);
			},
			[focusWindow, windowKey],
		);

		const handlePointerMove = useCallback(
			(e: React.PointerEvent) => {
				const win = ref.current;
				if (!win) return;

				const state = stateRef.current;

				if (isMaximizedRef.current) return;

				if (state.isResizing && state.resizeDirection && state.resizeStart) {
					const deltaX = e.clientX - state.resizeStart.mouse.x;
					const deltaY = e.clientY - state.resizeStart.mouse.y;
					const constraints = getWindowConstraints(windowKey);

					// Store latest delta — always use most recent input on RAF tick
					latestDeltaRef.current = { x: deltaX, y: deltaY };
					if (!rafPendingRef.current) {
						rafPendingRef.current = true;
						rafRef.current = requestAnimationFrame(() => {
							rafPendingRef.current = false;
							const result = calculateResize(
								state.resizeDirection!,
								state.resizeStart!,
								latestDeltaRef.current.x,
								latestDeltaRef.current.y,
								constraints,
							);
							applyResizeToElement(win, result);
							lastPosRef.current = { x: result.pos.x, y: result.pos.y, w: result.dim.width, h: result.dim.height };
						});
					}
				} else {
					const rect = win.getBoundingClientRect();
					const direction = getDirectionFromPosition(e.clientX, e.clientY, rect);
					win.style.cursor = direction ? getCursorForDirection(direction) : 'default';
				}
			},
			[windowKey],
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
				rafPendingRef.current = false;

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
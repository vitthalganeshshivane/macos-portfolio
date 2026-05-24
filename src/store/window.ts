import { DESKTOP_NAVBAR_HEIGHT } from '#lib/resize-engine';
import { INITIAL_Z_INDEX, WINDOW_CONFIG } from '#constants';
import type { WindowData, WindowKey } from '#types';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type { WindowData, WindowKey };

export interface WindowPosition {
	x: number;
	y: number;
}

export interface WindowSize {
	width: number;
	height: number;
}

interface WindowMeta {
	isOpen: boolean;
	zIndex: number;
	data: WindowData | null;
	position: WindowPosition | null;
	size: WindowSize | null;
	isMaximized: boolean;
	prevPosition: WindowPosition | null;
	prevSize: WindowSize | null;
}

export interface WindowState {
	windows: Record<WindowKey, WindowMeta>;
	nextZIndex: number;
	openWindow: (windowKey: WindowKey, data?: WindowData | null) => void;
	closeWindow: (windowKey: WindowKey) => void;
	focusWindow: (windowKey: WindowKey) => void;
	setWindowPosition: (windowKey: WindowKey, position: WindowPosition) => void;
	setWindowSize: (windowKey: WindowKey, size: WindowSize) => void;
	resetWindowSize: (windowKey: WindowKey) => void;
	toggleMaximize: (windowKey: WindowKey) => void;
}

const WINDOW_Y_MIN = DESKTOP_NAVBAR_HEIGHT + 16;
const clampY = (y: number): number => Math.max(WINDOW_Y_MIN, y);
const clampPosition = (p: WindowPosition): WindowPosition => ({ x: p.x, y: clampY(p.y) });

const getDefaultPosition = (windowKey: WindowKey): WindowPosition => {
	const positions: Record<string, WindowPosition> = {
		finder: { x: 100, y: 80 },
		safari: { x: 150, y: 100 },
		photos: { x: 200, y: 120 },
		contact: { x: 250, y: 140 },
		resume: { x: 180, y: 100 },
		terminal: { x: 80, y: 60 },
		veronica: { x: 120, y: 80 },
		txtfile: { x: 200, y: 100 },
		imgfile: { x: 220, y: 120 },
	};
	const pos = positions[windowKey] ?? { x: 100, y: 100 };
	const result: WindowPosition = { x: pos.x, y: clampY(pos.y) };
	console.log('getDefaultPosition', { windowKey, raw: pos, clamped: result, WINDOW_Y_MIN });
	return result;
};

const getDefaultSize = (windowKey: WindowKey): WindowSize => {
	const sizes: Record<string, WindowSize> = {
		finder: { width: 900, height: 650 },
		safari: { width: 1000, height: 700 },
		photos: { width: 850, height: 600 },
		contact: { width: 500, height: 600 },
		resume: { width: 750, height: 800 },
		terminal: { width: 700, height: 550 },
		veronica: { width: 750, height: 650 },
		txtfile: { width: 600, height: 450 },
		imgfile: { width: 700, height: 550 },
	};
	return sizes[windowKey] ?? { width: 600, height: 450 };
};

const createWindowMeta = (windowKey: WindowKey): WindowMeta => {
	const meta: WindowMeta = {
		isOpen: false,
		zIndex: INITIAL_Z_INDEX,
		data: null,
		position: getDefaultPosition(windowKey),
		size: getDefaultSize(windowKey),
		isMaximized: false,
		prevPosition: null,
		prevSize: null,
	};
	console.log('createWindowMeta', { windowKey, position: meta.position });
	return meta;
};

const useWindowStore = create<WindowState>()(
	immer((set) => ({
		windows: Object.keys(WINDOW_CONFIG).reduce((acc, key) => {
			acc[key as WindowKey] = createWindowMeta(key as WindowKey);
			return acc;
		}, {} as Record<WindowKey, WindowMeta>),
		nextZIndex: INITIAL_Z_INDEX + 1,

		openWindow: (windowKey, data = null) => {
			set((state: WindowState) => {
				const win = state.windows[windowKey];
				const posBefore = { ...win.position };
				win.isOpen = true;
				win.zIndex = state.nextZIndex++;

				win.data = data ?? win.data;

				if (!win.position) {
					win.position = getDefaultPosition(windowKey);
				}
				if (!win.size) {
					win.size = getDefaultSize(windowKey);
				}
				console.log('openWindow', { windowKey, posBefore, posAfter: { ...win.position } });
			});
		},

		closeWindow: (windowKey) => {
			set((state: WindowState) => {
				const win = state.windows[windowKey];
				win.isOpen = false;
				win.zIndex = INITIAL_Z_INDEX;
				win.data = null;
			});
		},

		focusWindow: (windowKey) => {
			set((state: WindowState) => {
				const win = state.windows[windowKey];
				if (!win.isOpen) return;
				win.zIndex = state.nextZIndex++;
			});
		},

		setWindowPosition: (windowKey, position) => {
			set((state: WindowState) => {
				const win = state.windows[windowKey];
				win.position = position;
			});
		},

		setWindowSize: (windowKey, size) => {
			set((state: WindowState) => {
				const win = state.windows[windowKey];
				win.size = size;
			});
		},

		resetWindowSize: (windowKey) => {
			set((state: WindowState) => {
				const win = state.windows[windowKey];
				win.size = getDefaultSize(windowKey);
			});
		},

		toggleMaximize: (windowKey) => {
			set((state: WindowState) => {
				const win = state.windows[windowKey];
				if (!win.isOpen) return;

				if (win.isMaximized) {
					const prevPos = { ...win.prevPosition! };
					win.isMaximized = false;
					win.position = win.prevPosition ? clampPosition(win.prevPosition) : getDefaultPosition(windowKey);
					win.size = win.prevSize ?? getDefaultSize(windowKey);
					win.prevPosition = null;
					win.prevSize = null;
					console.log('toggleMaximize (restore)', { windowKey, prevPos, restored: { ...win.position } });
				} else {
					win.prevPosition = win.position ? { ...clampPosition(win.position) } : getDefaultPosition(windowKey);
					win.prevSize = win.size ? { ...win.size } : getDefaultSize(windowKey);
					win.isMaximized = true;
					win.position = { x: 0, y: DESKTOP_NAVBAR_HEIGHT };
					win.size = { width: window.innerWidth, height: window.innerHeight - DESKTOP_NAVBAR_HEIGHT };
					console.log('toggleMaximize (max)', { windowKey, prevSaved: { ...win.prevPosition }, maximized: { ...win.position } });
				}
			});
		},
	})),
);

export default useWindowStore;
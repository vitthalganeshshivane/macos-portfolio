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
	return positions[windowKey] ?? { x: 100, y: 100 };
};

const getDefaultSize = (windowKey: WindowKey): WindowSize => {
	const sizes: Record<string, WindowSize> = {
		finder: { width: 500, height: 380 },
		safari: { width: 700, height: 500 },
		photos: { width: 600, height: 450 },
		contact: { width: 380, height: 450 },
		resume: { width: 500, height: 600 },
		terminal: { width: 450, height: 400 },
		veronica: { width: 500, height: 500 },
		txtfile: { width: 400, height: 300 },
		imgfile: { width: 500, height: 400 },
	};
	return sizes[windowKey] ?? { width: 400, height: 300 };
};

const createWindowMeta = (windowKey: WindowKey): WindowMeta => ({
	isOpen: false,
	zIndex: INITIAL_Z_INDEX,
	data: null,
	position: getDefaultPosition(windowKey),
	size: getDefaultSize(windowKey),
	isMaximized: false,
	prevPosition: null,
	prevSize: null,
});

const useWindowStore = create<WindowState>()(
	immer((set, get) => ({
		windows: Object.keys(WINDOW_CONFIG).reduce((acc, key) => {
			acc[key as WindowKey] = createWindowMeta(key as WindowKey);
			return acc;
		}, {} as Record<WindowKey, WindowMeta>),
		nextZIndex: INITIAL_Z_INDEX + 1,

		openWindow: (windowKey, data = null) => {
			set((state: WindowState) => {
				const win = state.windows[windowKey];
				win.isOpen = true;
				win.zIndex = state.nextZIndex++;
				win.data = data ?? win.data;

				if (!win.position) {
					win.position = getDefaultPosition(windowKey);
				}
				if (!win.size) {
					win.size = getDefaultSize(windowKey);
				}
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
					win.isMaximized = false;
					win.position = win.prevPosition ?? getDefaultPosition(windowKey);
					win.size = win.prevSize ?? getDefaultSize(windowKey);
					win.prevPosition = null;
					win.prevSize = null;
				} else {
					win.prevPosition = win.position ? { ...win.position } : getDefaultPosition(windowKey);
					win.prevSize = win.size ? { ...win.size } : getDefaultSize(windowKey);
					win.isMaximized = true;
					win.position = { x: 0, y: 0 };
					win.size = { width: window.innerWidth, height: window.innerHeight - 60 };
				}
			});
		},
	})),
);

export default useWindowStore;
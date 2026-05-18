import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { TerminalLine } from '../types';
import { MAX_HISTORY } from '../constants';

export interface VeronicaState {
	/** All terminal lines rendered so far. */
	lines: TerminalLine[];
	/** Current value of the input field. */
	input: string;
	/** Whether an AI request is in flight. */
	isLoading: boolean;
	/** Whether the boot sequence has completed. */
	hasBooted: boolean;
	/** Command history ring buffer (newest first). */
	history: string[];
	/** Current position in history (-1 = not browsing). */
	historyIndex: number;
	/** Conversation history for AI context (user/assistant pairs). */
	conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;

	// Actions
	appendLine: (line: TerminalLine) => void;
	appendLines: (lines: TerminalLine[]) => void;
	removeLine: (index: number) => void;
	clearLines: () => void;
	setInput: (value: string) => void;
	setLoading: (loading: boolean) => void;
	setHasBooted: (value: boolean) => void;
	pushHistory: (command: string) => void;
	navigateHistory: (direction: 'up' | 'down') => void;
	addConversationTurn: (userMessage: string, assistantResponse: string) => void;
	reset: () => void;
}

const useVeronicaStore = create<VeronicaState>()(
	immer((set) => ({
		lines: [],
		input: '',
		isLoading: false,
		hasBooted: false,
		history: [],
		historyIndex: -1,
		conversationHistory: [],

		appendLine: (line) => {
			set((state) => {
				state.lines.push(line);
			});
		},

		appendLines: (lines) => {
			set((state) => {
				state.lines.push(...lines);
			});
		},

		removeLine: (index) => {
			set((state) => {
				state.lines.splice(index, 1);
			});
		},

		clearLines: () => {
			set((state) => {
				state.lines = [];
			});
		},

		setInput: (value) => {
			set((state) => {
				state.input = value;
			});
		},

		setLoading: (loading) => {
			set((state) => {
				state.isLoading = loading;
			});
		},

		setHasBooted: (value) => {
			set((state) => {
				state.hasBooted = value;
			});
		},

		pushHistory: (command) => {
			set((state) => {
				if (state.history[0] === command) return;
				state.history.unshift(command);
				if (state.history.length > MAX_HISTORY) {
					state.history.pop();
				}
				state.historyIndex = -1;
			});
		},

		navigateHistory: (direction) => {
			set((state) => {
				if (direction === 'up') {
					const next = state.historyIndex + 1;
					if (next < state.history.length) {
						state.historyIndex = next;
						state.input = state.history[next];
					}
				} else {
					const next = state.historyIndex - 1;
					if (next >= 0) {
						state.historyIndex = next;
						state.input = state.history[next];
					} else {
						state.historyIndex = -1;
						state.input = '';
					}
				}
			});
		},

		addConversationTurn: (userMessage, assistantResponse) => {
			set((state) => {
				state.conversationHistory.push(
					{ role: 'user', content: userMessage },
					{ role: 'assistant', content: assistantResponse },
				);
				// Keep last 20 turns (40 messages) to avoid token bloat
				if (state.conversationHistory.length > 40) {
					state.conversationHistory = state.conversationHistory.slice(-40);
				}
			});
		},

		reset: () => {
			set((state) => {
				state.lines = [];
				state.input = '';
				state.isLoading = false;
				state.hasBooted = false;
				state.historyIndex = -1;
				state.conversationHistory = [];
			});
		},
	})),
);

export default useVeronicaStore;

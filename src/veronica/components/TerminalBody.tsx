import {
	useCallback,
	useEffect,
	useRef,
	type KeyboardEvent as ReactKeyboardEvent,
	type ReactElement,
} from 'react';
import { useWindowStore } from '#store';
import { useVeronicaStore } from '../store';
import { executeCommand, registry } from '../engine';
import { PROMPT } from '../constants';
import { initializeAI } from '../ai';
import { LineRenderer } from './LineRenderer';
import { BootSequence } from './BootSequence';
import '../commands';

// Initialize AI providers once on first mount
let aiInitialized = false;

export const TerminalBody = (): ReactElement => {
	const containerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const lines = useVeronicaStore((s) => s.lines);
	const input = useVeronicaStore((s) => s.input);
	const isLoading = useVeronicaStore((s) => s.isLoading);
	const hasBooted = useVeronicaStore((s) => s.hasBooted);
	const conversationHistory = useVeronicaStore((s) => s.conversationHistory);
	const setInput = useVeronicaStore((s) => s.setInput);
	const appendLines = useVeronicaStore((s) => s.appendLines);
	const removeLine = useVeronicaStore((s) => s.removeLine);
	const clearLines = useVeronicaStore((s) => s.clearLines);
	const setLoading = useVeronicaStore((s) => s.setLoading);
	const pushHistory = useVeronicaStore((s) => s.pushHistory);
	const navigateHistory = useVeronicaStore((s) => s.navigateHistory);
	const addConversationTurn = useVeronicaStore((s) => s.addConversationTurn);

	const openWindow = useWindowStore((s) => s.openWindow);
	const windows = useWindowStore((s) => s.windows);

	// Initialize AI providers once
	useEffect(() => {
		if (!aiInitialized) {
			aiInitialized = true;
			initializeAI();
		}
	}, []);

	// Auto-scroll to bottom on new lines
	// Double-rAF ensures the browser has finished layout before we read scrollHeight
	useEffect(() => {
		const container = containerRef.current;
		if (container) {
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					container.scrollTop = container.scrollHeight;
				});
			});
		}
	}, [lines.length, isLoading]);

	// Focus input when clicking terminal body
	const handleContainerClick = useCallback(() => {
		if (!isLoading) {
			inputRef.current?.focus();
		}
	}, [isLoading]);

	const handleKeyDown = useCallback(
		async (e: ReactKeyboardEvent<HTMLInputElement>) => {
			switch (e.key) {
				case 'Enter': {
					e.preventDefault();
					const trimmed = input.trim();

					if (trimmed === '') {
						appendLines([
							{ kind: 'input', prompt: PROMPT, text: '' },
						]);
						return;
					}

					pushHistory(trimmed);
					setInput('');

					// Clear command — handle synchronously
					if (trimmed === 'clear' || trimmed === 'cls') {
						clearLines();
						return;
					}

					// Execute command (sync for deterministic, async for AI)
					const resultLines = await executeCommand(
						trimmed,
						{ openWindow, windows },
						conversationHistory,
						setLoading,
						appendLines,
					);

					// Always clean up loading indicator after await
					// Read fresh state — `lines` closure is stale after await
					const currentLines = useVeronicaStore.getState().lines;
					const lastLine = currentLines[currentLines.length - 1];
					if (lastLine?.kind === 'loading') {
						removeLine(currentLines.length - 1);
					}

					if (resultLines.length > 0) {
						appendLines(resultLines);

						// Track AI conversation for context
						const responseText = resultLines
							.filter((l) => l.kind === 'output')
							.map((l) =>
								l.kind === 'output'
									? l.segments.map((s) => s.text).join('')
									: '',
							)
							.join('\n');
						if (responseText) {
							addConversationTurn(trimmed, responseText);
						}
					}
					break;
				}

				case 'ArrowUp':
					e.preventDefault();
					navigateHistory('up');
					break;

				case 'ArrowDown':
					e.preventDefault();
					navigateHistory('down');
					break;

				case 'c':
					if (e.ctrlKey) {
						e.preventDefault();
						setInput('');
						appendLines([
							{ kind: 'input', prompt: PROMPT, text: input },
							{ kind: 'system', text: '^C' },
						]);
					}
					break;

				case 'l':
					if (e.ctrlKey) {
						e.preventDefault();
						clearLines();
					}
					break;

				case 'Tab': {
					e.preventDefault();
					const trimmedInput = input.trim().toLowerCase();
					if (!trimmedInput) break;

					const allNames = registry.getNames();
					const match = allNames.find((n) =>
						n.startsWith(trimmedInput),
					);
					if (match) {
						setInput(match);
					}
					break;
				}
			}
		},
		[
			input,
			lines,
			conversationHistory,
			appendLines,
			removeLine,
			clearLines,
			setInput,
			pushHistory,
			navigateHistory,
			setLoading,
			addConversationTurn,
			openWindow,
			windows,
		],
	);

	return (
		<div
			className="terminal-body"
			ref={containerRef}
			onClick={handleContainerClick}
			role="application"
			aria-label="Veronica terminal"
		>
			<BootSequence />

			{lines.map((line, index) => (
				<LineRenderer
					key={index}
					line={line}
					onSuggestionClick={(cmd) => {
						setInput(cmd);
						inputRef.current?.focus();
					}}
				/>
			))}

			{hasBooted && (
				<div className="terminal-input-line">
					<span className="terminal-prompt">{PROMPT}</span>
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={(e) => {
							setInput(e.target.value);
						}}
						onKeyDown={handleKeyDown}
						className="terminal-input"
						autoFocus
						spellCheck={false}
						autoComplete="off"
						autoCapitalize="off"
						disabled={isLoading}
						placeholder={isLoading ? 'Waiting for response...' : ''}
					/>
				</div>
			)}
		</div>
	);
};

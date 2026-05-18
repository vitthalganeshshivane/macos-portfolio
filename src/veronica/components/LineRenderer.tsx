import type { ReactElement } from 'react';
import type { TerminalLine } from '../types';
import { SegmentRenderer } from './SegmentRenderer';

interface LineRendererProps {
	line: TerminalLine;
	onSuggestionClick?: (command: string) => void;
}

export const LineRenderer = ({
	line,
	onSuggestionClick,
}: LineRendererProps): ReactElement => {
	switch (line.kind) {
		case 'input':
			return (
				<p className="terminal-line">
					<span className="terminal-prompt">{line.prompt}</span>{' '}
					<span>{line.text}</span>
				</p>
			);

		case 'output':
			return (
				<p className="terminal-line">
					{line.segments.map((seg, i) => (
						<SegmentRenderer key={i} segment={seg} />
					))}
				</p>
			);

		case 'system':
			return <p className="terminal-line terminal-system">{line.text}</p>;

		case 'error':
			return <p className="terminal-line terminal-error">{line.text}</p>;

		case 'loading':
			return (
				<p className="terminal-line terminal-loading animate-pulse">
					thinking...
				</p>
			);

		case 'suggestion':
			return (
				<p className="terminal-line terminal-suggestion">
					<button
						type="button"
						className="cursor-pointer underline hover:text-yellow-400"
						onClick={() => {
							onSuggestionClick?.(line.suggestedCommand);
						}}
					>
						{line.text}
					</button>
				</p>
			);
	}
};

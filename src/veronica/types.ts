import type { WindowKey } from '#types';

/** Discriminated union for all terminal output line types. */
export type TerminalLine =
	| InputLine
	| OutputLine
	| SystemLine
	| ErrorLine
	| LoadingLine
	| SuggestionLine;

/** The user's typed command, rendered with the prompt prefix. */
export interface InputLine {
	kind: 'input';
	prompt: string;
	text: string;
}

/** Normal command output — one or more text segments. */
export interface OutputLine {
	kind: 'output';
	segments: OutputSegment[];
}

/** System message (boot sequence, info banners). */
export interface SystemLine {
	kind: 'system';
	text: string;
}

/** Error message (command not found, API failure). */
export interface ErrorLine {
	kind: 'error';
	text: string;
}

/** Loading indicator while waiting for AI response. */
export interface LoadingLine {
	kind: 'loading';
}

/** Suggestion line for fuzzy command matches. */
export interface SuggestionLine {
	kind: 'suggestion';
	text: string;
	suggestedCommand: string;
}

/** Styled inline segment within an output line. */
export interface OutputSegment {
	text: string;
	color?: TerminalColor;
	bold?: boolean;
	href?: string;
}

/** Supported terminal colors — maps to Tailwind classes. */
export type TerminalColor = 'green' | 'red' | 'yellow' | 'blue' | 'muted';

/** Command definition interface. */
export interface CommandDefinition {
	name: string;
	aliases?: string[];
	description: string;
	usage?: string;
	execute: (args: string[], context: CommandContext) => CommandResult;
}

/** Context passed to command handlers. */
export interface CommandContext {
	openWindow: (key: WindowKey) => void;
	windows: Record<WindowKey, { isOpen: boolean }>;
}

/** Result returned by command handlers. */
export interface CommandResult {
	lines: TerminalLine[];
	openWindow?: WindowKey;
}

/** AI provider interface. */
export interface AIProvider {
	readonly name: string;
	readonly id: string;
	complete(request: AIRequest): Promise<AIResponse>;
}

/** AI request shape. */
export interface AIRequest {
	userMessage: string;
	systemPrompt: string;
	history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

/** AI response shape. */
export interface AIResponse {
	text: string;
	usage?: { prompt: number; completion: number };
}

/** AI provider identifiers. */
export type AIProviderId = 'openrouter' | 'nvidia-nim';

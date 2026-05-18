import type { TerminalLine, CommandContext } from '../types';
import type { SuggestionLine, InputLine, ErrorLine } from '../types';
import { registry } from './command-registry';
import { findSimilarCommands, isConversationalInput } from './fuzzy-match';
import { PROMPT } from '../constants';
import { aiRegistry, buildAIRequest, formatAIResponse } from '../ai';

/**
 * Execute a raw input string against the command registry.
 * Returns terminal lines to render.
 * For deterministic commands, resolves immediately.
 * For natural language, routes to AI provider.
 */
export async function executeCommand(
	rawInput: string,
	context: CommandContext,
	conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
	onLoadingChange: (loading: boolean) => void,
	onAppendLines: (lines: TerminalLine[]) => void,
): Promise<TerminalLine[]> {
	const trimmed = rawInput.trim();
	if (trimmed === '') return [];

	const inputLine: InputLine = {
		kind: 'input',
		prompt: PROMPT,
		text: trimmed,
	};

	// 1. Exact command match → deterministic execution
	const result = registry.lookup(trimmed);

	if (result) {
		const { command, args } = result;
		const commandResult = command.execute(args, context);

		if (commandResult.openWindow) {
			context.openWindow(commandResult.openWindow);
		}

		return [inputLine, ...commandResult.lines];
	}

	// 2. Conversational input (greetings, questions) → skip fuzzy, go to AI
	if (isConversationalInput(trimmed)) {
		return await handleAIRequest(
			trimmed,
			inputLine,
			conversationHistory,
			onLoadingChange,
			onAppendLines,
		);
	}

	// 3. Check for fuzzy command matches (typos like "hlep" → "help")
	const candidates = registry.getNames();
	const suggestions = findSimilarCommands(trimmed, candidates);

	if (suggestions.length > 0) {
		const lines: TerminalLine[] = [inputLine];

		const errorLine: ErrorLine = {
			kind: 'error',
			text: `command not found: ${trimmed}`,
		};
		lines.push(errorLine);

		lines.push({ kind: 'system', text: '' });
		lines.push({ kind: 'system', text: 'Did you mean:' });

		for (const suggestion of suggestions) {
			const suggestionLine: SuggestionLine = {
				kind: 'suggestion',
				text: `  ${suggestion}`,
				suggestedCommand: suggestion,
			};
			lines.push(suggestionLine);
		}

		return lines;
	}

	// 4. No command match, no fuzzy match → natural language → AI
	return await handleAIRequest(
		trimmed,
		inputLine,
		conversationHistory,
		onLoadingChange,
		onAppendLines,
	);
}

async function handleAIRequest(
	userMessage: string,
	inputLine: InputLine,
	conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
	onLoadingChange: (loading: boolean) => void,
	onAppendLines: (lines: TerminalLine[]) => void,
): Promise<TerminalLine[]> {
	const hasProvider = aiRegistry.getActive() !== null;

	if (!hasProvider) {
		return [
			inputLine,
			{
				kind: 'system',
				text: 'No AI provider configured. Set VITE_OPENROUTER_API_KEY in .env',
			},
			{
				kind: 'system',
				text: 'Type \'help\' for available commands.',
			},
		];
	}

	// Show input line immediately, then loading indicator
	onAppendLines([inputLine, { kind: 'loading' }]);
	onLoadingChange(true);

	try {
		const request = buildAIRequest(userMessage, conversationHistory);
		const response = await aiRegistry.route(request);
		const responseLines = formatAIResponse(response.text);

		onLoadingChange(false);

		// Guard against empty AI responses — loading indicator must always be cleaned up
		if (responseLines.length === 0) {
			return [{ kind: 'system', text: 'No response received.' }];
		}

		return responseLines;
	} catch (error) {
		onLoadingChange(false);
		const isError = error instanceof Error;
		const errorMessage = isError ? error.message : 'Unknown error';
		const errorName = isError ? error.name : '';

		// Terminal-native error — don't expose stack traces
		if (errorName === 'AbortError' || errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
			return [{ kind: 'error', text: 'Provider timeout. Retry in a few moments.' }];
		}
		if (errorMessage.includes('429') || errorMessage.includes('rate')) {
			return [{ kind: 'error', text: 'Rate limited. Wait a moment and try again.' }];
		}
		if (errorMessage.includes('401') || errorMessage.includes('403')) {
			return [{ kind: 'error', text: 'Provider auth failed. Check API key.' }];
		}

		return [{ kind: 'error', text: `Provider error: ${errorMessage}` }];
	}
}

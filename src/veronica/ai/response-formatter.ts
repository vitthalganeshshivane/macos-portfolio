import type { TerminalLine, OutputLine } from '../types';

/** Maximum lines in a formatted AI response. */
const MAX_RESPONSE_LINES = 40;

/** Assistant-style phrases to strip from responses. */
const ASSISTANT_PHRASES = [
	/^great question[!.]?\s*/i,
	/^absolutely[!.]?\s*/i,
	/^sure[!.]?\s*/i,
	/^of course[!.]?\s*/i,
	/^certainly[!.]?\s*/i,
	/^happy to help[!.]?\s*/i,
	/^here('s| is| are)\b/i,
	/^let me\b/i,
	/^i('d| would) be happy\b/i,
	/^as an ai\b/i,
	/^i'm glad you asked\b/i,
];

/**
 * Convert raw AI response text into terminal-formatted lines.
 * Strips markdown, assistant phrases, and enforces terminal constraints.
 */
export function formatAIResponse(rawText: string): TerminalLine[] {
	const lines = rawText.split('\n');

	const result: TerminalLine[] = [];

	for (const line of lines) {
		// Enforce max line count
		if (result.length >= MAX_RESPONSE_LINES) break;

		let trimmed = line.trimEnd();

		// Skip truly empty lines but preserve intentional spacing
		if (trimmed === '') {
			if (result.length > 0 && result[result.length - 1]?.kind !== 'system') {
				result.push({ kind: 'system', text: '' });
			}
			continue;
		}

		// Strip markdown-style formatting
		trimmed = trimmed
			.replace(/^#{1,6}\s+/gm, '') // Strip markdown headers
			.replace(/^\s*[-*]\s/gm, '  - ') // Normalize bullet points
			.replace(/\*\*(.*?)\*\*/g, '$1') // Strip bold markers
			.replace(/\*(.*?)\*/g, '$1') // Strip italic markers
			.replace(/`(.*?)`/g, '$1') // Strip inline code markers
			.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Strip markdown links to text

		// Strip assistant-style phrases from the start of the response
		if (result.length === 0 || (result.length === 1 && result[0]?.kind === 'system')) {
			for (const phrase of ASSISTANT_PHRASES) {
				trimmed = trimmed.replace(phrase, '');
			}
			trimmed = trimmed.trimStart();
			if (trimmed === '') continue;
		}

		// No manual truncation — CSS break-words handles wrapping naturally

		const outputLine: OutputLine = {
			kind: 'output',
			segments: [{ text: trimmed }],
		};
		result.push(outputLine);
	}

	// Remove trailing blank lines
	while (result.length > 0 && result[result.length - 1]?.kind === 'system') {
		result.pop();
	}

	return result;
}

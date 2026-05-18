import type { AIRequest } from '../types';
import { AI_SYSTEM_PROMPT } from '../constants';

const MAX_HISTORY_PAIRS = 10;

/**
 * Build an AI request from user message and conversation history.
 */
export function buildAIRequest(
	userMessage: string,
	recentHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
): AIRequest {
	// Only include the last N history pairs to stay within token limits
	const trimmedHistory = recentHistory.slice(-MAX_HISTORY_PAIRS * 2);

	return {
		userMessage,
		systemPrompt: AI_SYSTEM_PROMPT,
		history: trimmedHistory,
	};
}

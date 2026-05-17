/**
 * Lightweight Levenshtein distance for fuzzy command matching.
 * No external dependencies.
 */
function levenshtein(a: string, b: string): number {
	const m = a.length;
	const n = b.length;

	if (m === 0) return n;
	if (n === 0) return m;

	const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);

	for (let i = 1; i <= m; i++) {
		let prev = dp[0];
		dp[0] = i;

		for (let j = 1; j <= n; j++) {
			const temp = dp[j];
			if (a[i - 1] === b[j - 1]) {
				dp[j] = prev;
			} else {
				dp[j] = 1 + Math.min(prev, dp[j], dp[j - 1]);
			}
			prev = temp;
		}
	}

	return dp[n];
}

/**
 * Find the closest matching command names for a given input.
 * Returns suggestions sorted by edit distance (closest first).
 */
export function findSimilarCommands(
	input: string,
	candidates: string[],
	maxDistance = 2,
	maxResults = 3,
): string[] {
	const lower = input.toLowerCase();

	const scored = candidates
		.map((candidate) => ({
			candidate,
			distance: levenshtein(lower, candidate.toLowerCase()),
		}))
		.filter(({ distance }) => distance > 0 && distance <= maxDistance)
		.sort((a, b) => a.distance - b.distance);

	return scored.slice(0, maxResults).map(({ candidate }) => candidate);
}

/**
 * Check if input looks like a command (single word, no spaces).
 * Used to distinguish typos from natural language AI queries.
 */
export function looksLikeCommand(input: string): boolean {
	const trimmed = input.trim();
	return !trimmed.includes(' ') && trimmed.length < 24;
}

/**
 * Common conversational words that should never be treated as command typos.
 * If the input starts with any of these, route directly to AI.
 */
const CONVERSATIONAL_STARTERS = new Set([
	'hi', 'hii', 'hiii', 'hey', 'heya', 'hello', 'helo', 'howdy',
	'yo', 'sup', 'wassup', 'waddup', 'greetings',
	'good', 'morning', 'afternoon', 'evening', 'night',
	'what', 'who', 'where', 'when', 'why', 'how', 'which',
	'tell', 'explain', 'describe', 'show', 'list', 'give',
	'can', 'could', 'would', 'should', 'will', 'do', 'does',
	'i', 'my', 'your', 'we', 'they', 'he', 'she', 'it',
	'thanks', 'thank', 'please', 'sorry', 'ok', 'okay', 'sure',
	'bye', 'goodbye', 'later', 'cya',
]);

/**
 * Detect conversational/natural-language input that should bypass
 * fuzzy command matching and go directly to AI.
 */
export function isConversationalInput(input: string): boolean {
	const firstWord = input.trim().toLowerCase().split(/\s+/)[0] ?? '';
	return CONVERSATIONAL_STARTERS.has(firstWord);
}

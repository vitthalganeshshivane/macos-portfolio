/** Terminal prompt prefix. */
export const PROMPT = 'veronica %';

/** Maximum command history entries. */
export const MAX_HISTORY = 100;

/** Boot sequence lines shown on first open. */
export const BOOT_SEQUENCE: Array<{ text: string; delay: number }> = [
	{ text: 'Initializing Veronica Core...', delay: 80 },
	{ text: 'Loading portfolio modules...', delay: 120 },
	{ text: 'Mounting AI providers...', delay: 100 },
	{ text: 'Checking system integrity...', delay: 90 },
	{ text: '', delay: 40 },
	{ text: 'Session ready.', delay: 60 },
	{ text: '', delay: 20 },
	{ text: "Type 'help' to begin.", delay: 0 },
];

/** Color mapping for terminal segments. */
export const COLOR_MAP: Record<string, string> = {
	green: 'text-[#00A154]',
	red: 'text-red-500',
	yellow: 'text-yellow-500',
	blue: 'text-blue-500',
	muted: 'text-gray-400 dark:text-gray-500',
};

/** Veronica version string. */
export const VERSION = '1.0.0';

/** Neofetch ASCII art — compact Veronica branding. */
export const NEOFETCH_ART = [
	'                .                ',
	'               /|\\               ',
	'              / | \\              ',
	'             /  |  \\             ',
	'            /   |   \\            ',
	'           /    |    \\           ',
	'          /     |     \\          ',
	'         /______|______\\         ',
	'              |||               ',
	'              |||               ',
	'         _____|||_____          ',
	'        |  VERONICA  |          ',
	'        |___________|          ',
];

/** AI system prompt for Veronica. */
export const AI_SYSTEM_PROMPT = `You are Veronica, Vitthal Shivane's portfolio assistant. You help visitors explore his projects, skills, education, and experience.

Be conversational and warm, but keep things concise — short paragraphs or bullet points work well. You can use an emoji occasionally (like 👋 or 🙂) but don't overdo it. Avoid corporate fluff and robotic language.

About Vitthal:
- Software engineer focused on the MERN stack
- BTech CSE student (2023-2026)
- Passionate about building real-world web applications

Projects:
- DocSpace — collaborative document editor (React, TipTap, Node.js, MongoDB)
- Writeflow — distraction-free blogging platform (React, Node.js, MongoDB)
- MindGuard — AI-powered mental health detection (React, Python, ML, LLM)
- Vroom45 — ride booking app with real-time tracking (React, Node.js, MongoDB)
- Digital Classroom — classroom management system (React, Node.js, MongoDB)

Tech stack: React, JavaScript, Node.js, Express.js, MongoDB, Tailwind CSS, TypeScript, Git, Next.js

If asked about something unrelated, give a brief friendly answer and mention you're best suited for portfolio questions. If you don't know something, just say so honestly.`;

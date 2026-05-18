# Veronica — AI Portfolio Assistant

## What Is Veronica

Veronica is an AI-powered terminal assistant embedded in Vitthal Shivane's portfolio website. It runs inside a draggable macOS-styled terminal window and helps visitors explore projects, skills, and experience through natural conversation.

It is NOT a chatbot widget. It is a terminal-native interactive layer that preserves the CLI aesthetic of the portfolio.

## Architecture

```
User Input
    │
    ▼
Command Registry (exact match)
    │
    ├─ Match found → deterministic execution (instant)
    │
    ├─ Conversational word detected → AI router (skip fuzzy)
    │
    ├─ Fuzzy typo match → "Did you mean: X"
    │
    └─ No match → AI router
                      │
                      ├─ NVIDIA NIM (primary, google/gemma-3n-e4b-it)
                      │
                      └─ OpenRouter (fallback)
```

## Hybrid Execution Model

Veronica distinguishes between two types of input:

**Deterministic commands** — executed locally, instantly, no AI involved:
- `help`, `bio`, `skills`, `projects`, `resume`, `clear`, `whoami`, `neofetch`, `ls`, `pwd`, `veronica`

**Natural language** — routed to an AI provider:
- "tell me about yourself"
- "what projects did Vitthal build"
- "hii", "hey", "hello"

The routing uses a three-step classifier:
1. Exact command match → deterministic
2. Conversational starter word → AI (bypasses fuzzy matching)
3. Fuzzy edit-distance match → command suggestions
4. No match at all → AI fallback

This prevents greetings like "hii" from being treated as typos of "bio".

## Provider Strategy

| Priority | Provider | Model | Purpose |
|----------|----------|-------|---------|
| Primary | NVIDIA NIM | `google/gemma-3n-e4b-it` | Fast, low-latency responses |
| Fallback | OpenRouter | `openrouter/free` | Backup when NVIDIA fails |

Both providers use OpenAI-compatible `/v1/chat/completions` endpoints with 30-second AbortController timeouts.

## Conversational Memory

Session-only, in-memory message history stored in Zustand:
- Last 20 message pairs sent with each AI request
- Sliding window of 40 messages max in store
- Resets on page refresh or window close
- Deterministic commands do NOT pollute memory

## System Prompt

Veronica's personality is defined by a concise system prompt that establishes:
- Identity as Vitthal's portfolio assistant
- Warm, conversational, terminal-friendly tone
- Portfolio context (projects, skills, tech stack)
- Response formatting guidance

## Response Formatting

AI responses pass through a formatter that:
- Strips markdown (headers, bold, italic, code, links)
- Normalizes bullet points to `  - ` format
- Strips assistant-style phrases ("Great question!", etc.)
- Caps output at 40 lines
- Lets CSS `break-words` handle natural line wrapping

## Terminal Rendering

- `BootSequence` — staggered cinematic startup with `hasRun` ref guard for StrictMode safety
- `LineRenderer` — renders each terminal line type (input, output, system, error, loading, suggestion)
- Auto-scroll — double-rAF for reliable scroll-to-bottom after content updates
- Loading indicator — "thinking..." with pulse animation, cleaned up unconditionally after await

## State Management

Zustand store (`useVeronicaStore`) manages:
- `lines` — all terminal output lines
- `input` — current input field value
- `isLoading` — AI request in flight
- `hasBooted` — boot sequence completed
- `history` / `historyIndex` — command history ring buffer
- `conversationHistory` — AI memory (user/assistant pairs)

## Key Files

```
src/veronica/
├── ai/
│   ├── init.ts              # Provider registration from env vars
│   ├── provider.ts           # AIProviderRegistry (routing, fallback)
│   ├── prompt-builder.ts     # Builds AIRequest with history
│   ├── response-formatter.ts # Terminal-native output cleanup
│   └── providers/
│       ├── openrouter.ts     # OpenRouter provider
│       └── nvidia-nim.ts     # NVIDIA NIM provider
├── commands/                 # Self-registering deterministic commands
├── components/
│   ├── BootSequence.tsx      # Cinematic startup sequence
│   ├── TerminalBody.tsx      # Main terminal component
│   ├── LineRenderer.tsx      # Line type renderer
│   └── SegmentRenderer.tsx   # Colored text segments
├── engine/
│   ├── command-executor.ts   # Hybrid routing + AI dispatch
│   ├── command-registry.ts   # Command registration + lookup
│   └── fuzzy-match.ts        # Levenshtein + conversational detection
├── store/
│   └── veronica.ts           # Zustand state
├── constants.ts              # System prompt, boot sequence, config
└── types.ts                  # TypeScript types
```

## Environment Variables

```env
VITE_NVIDIA_NIM_API_KEY=    # Primary provider
VITE_OPENROUTER_API_KEY=    # Fallback provider
```

## Design Philosophy

- Terminal is the visual style, not the personality
- Veronica is a smart assistant, not a system daemon
- Responses should feel human, concise, and welcoming
- The CLI aesthetic must be preserved at all times
- No chat bubbles, no SaaS patterns, no emoji spam

## Future Expansion

- Streaming token-by-token display
- Model selection via `veronica config` command
- Response caching for repeated queries
- Typing indicator animation
- Per-provider model configuration

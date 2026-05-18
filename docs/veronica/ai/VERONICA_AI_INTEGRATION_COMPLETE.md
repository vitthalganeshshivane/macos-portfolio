# Veronica AI Integration — Complete

## Architecture

Veronica uses **hybrid execution**:

```
User Input
    │
    ▼
Command Registry (deterministic lookup)
    │
    ├─ Match found → execute instantly, return lines
    │
    ├─ Looks like command (single word, <24 chars) → fuzzy match suggestions
    │
    └─ Natural language → AI Router
                              │
                              ├─ OpenRouter (primary)
                              │
                              └─ NVIDIA NIM (fallback)
```

## Provider Routing

### Primary: OpenRouter
- Model: `meta-llama/llama-3.1-8b-instruct:free`
- API: OpenAI-compatible `/v1/chat/completions`
- Timeout: 30s via AbortController
- Headers: `HTTP-Referer`, `X-Title` for OpenRouter tracking

### Fallback: NVIDIA NIM
- Model: `meta/llama-3.1-8b-instruct`
- API: OpenAI-compatible `/v1/chat/completions`
- Timeout: 30s via AbortController
- Activated when OpenRouter fails

### Fallback Chain
```
aiRegistry.route(request)
    → try active provider (OpenRouter)
    → catch → try fallback providers (NVIDIA NIM)
    → catch → throw last error
```

## Environment Variables

```env
VITE_OPENROUTER_API_KEY=    # Primary provider
VITE_NVIDIA_NIM_API_KEY=    # Fallback provider (optional)
```

If neither key is set, the executor shows:
```
No AI provider configured. Set VITE_OPENROUTER_API_KEY in .env
Type 'help' for available commands.
```

## System Prompt Strategy

The system prompt establishes Veronica as:
- A terminal-based system utility (NOT a chatbot)
- Embedded in Vitthal's portfolio
- Concise, technical, CLI-formatted
- Portfolio-aware (projects, skills, education, contact)

Response rules enforced:
- Max 6-8 lines per response
- No markdown headers, bold, italics, emojis
- No assistant phrases ("Great question!", "Absolutely!")
- 72-char line width limit
- CLI-formatted bullet points

## Context Injection

Portfolio context is embedded directly in the system prompt:
- Owner: Vitthal Ganesh Shivane
- 5 projects with descriptions and tech tags
- Full tech stack categorized
- Education, role, contact info

No RAG, no vector DB — simple structured context.

## Response Formatting

`formatAIResponse()` enforces terminal constraints:
1. Strips markdown (headers, bold, italic, code, links)
2. Normalizes bullet points to `  - ` format
3. Strips assistant-style phrases from response start
4. Truncates lines at 72 characters
5. Caps output at 16 lines
6. Removes trailing blank lines

## Error Handling

| Error | Terminal Message |
|-------|-----------------|
| AbortError (timeout) | `Provider timeout. Retry in a few moments.` |
| 429 / rate limit | `Rate limited. Wait a moment and try again.` |
| 401 / 403 | `Provider auth failed. Check API key.` |
| Empty response | `No response received.` |
| No provider | `No AI provider configured. Set VITE_OPENROUTER_API_KEY in .env` |
| Other | `Provider error: {message}` |

## Conversation History

- Stored in Zustand (`conversationHistory`)
- Last 10 user/assistant pairs sent with each request
- Trimmed to stay within token limits
- Cleared on `clear` command

## Files Modified

| File | Change |
|------|--------|
| `src/veronica/constants.ts` | Enhanced system prompt with portfolio context |
| `src/veronica/ai/response-formatter.ts` | Added phrase stripping, line limits, markdown cleanup |
| `src/veronica/ai/providers/openrouter.ts` | Added 30s AbortController timeout |
| `src/veronica/ai/providers/nvidia-nim.ts` | Added 30s AbortController timeout |
| `src/veronica/engine/command-executor.ts` | Added AbortError detection in error handler |

## Runtime Verification

- `npx tsc --noEmit` passes with zero errors
- Deterministic commands bypass AI completely
- Natural language routes through AI provider chain
- Loading states clean up correctly after await
- Error paths return terminal-native messages
- Response formatter enforces CLI constraints
- Timeout handling via AbortController (30s)

## What's NOT Implemented (By Design)

- Streaming responses
- Memory / conversation persistence
- Voice input/output
- Web browsing / search
- RAG / vector database
- Local model inference
- Multi-agent orchestration

## Future Improvements

- Streaming token-by-token display
- Model selection via `veronica config` command
- Response caching for repeated queries
- Typing indicator animation
- Per-provider model configuration

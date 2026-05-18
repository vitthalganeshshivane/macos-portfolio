# Veronica Implementation Progress

## Branch

`feature/veronica-terminal-ai`

## What Was Implemented

### Phase 1 — Window Integration

**Files modified:**
- `src/types/windows.ts` — Added `'veronica'` to `WindowKey` union
- `src/constants/index.ts` — Added `veronica` to `WINDOW_CONFIG` and `dockApps`
- `src/App.tsx` — Added lazy imports, `OpenWindows` entry, conditional rendering
- `src/windows/index.ts` — Added barrel exports for Veronica + MobileVeronica
- `vite.config.ts` — Added `#veronica` path alias
- `tsconfig.app.json` — Added `#veronica` path mapping
- `src/index.css` — Added `#veronica` and `#mobile-veronica` CSS blocks

**Files created:**
- `src/windows/Veronica.tsx` — Desktop window using `WindowWrapper` HOC
- `src/windows/mobile/Veronica.tsx` — Mobile window using `MobileWindowWrapper` HOC

**Consistency preserved:**
- Uses existing `WindowWrapper`, `WindowControls`, `window-header`, `window-header-spacer`
- Window CSS mirrors `#terminal` exactly: `top-32 left-1/12 w-xl rounded-xl bg-white dark:bg-dark-700 shadow-2xl drop-shadow-2xl`
- Reuses `terminal.png` icon in dock (same terminal aesthetic)
- Mobile variant follows `MobileWindowWrapper` + `MobileWindowHeader` patterns

### Phase 2 — Terminal Rendering Engine

**Files created:**
- `src/veronica/types.ts` — All Veronica-specific types (discriminated unions)
- `src/veronica/constants.ts` — Prompt, boot sequence, color map, neofetch art, AI system prompt
- `src/veronica/store/veronica.ts` — Zustand + Immer store with lines, input, history, loading state
- `src/veronica/store/index.ts` — Barrel export
- `src/veronica/components/SegmentRenderer.tsx` — Renders styled output segments
- `src/veronica/components/LineRenderer.tsx` — Renders terminal lines by kind
- `src/veronica/components/BootSequence.tsx` — Cinematic boot sequence with staggered timing
- `src/veronica/components/TerminalBody.tsx` — Main interactive terminal component
- `src/veronica/components/index.ts` — Barrel export
- `src/veronica/index.ts` — Top-level barrel

**Terminal features:**
- Auto-scroll on new lines
- Auto-focus on window open and container click
- Arrow up/down command history (100-entry ring buffer)
- Ctrl+C to cancel input (echoes `^C`)
- Ctrl+L to clear screen
- Tab autocomplete (first prefix match)
- Loading indicator with `animate-pulse`
- Suggestion lines are clickable buttons

**Boot sequence:**
- 7 staggered lines with 20-120ms delays
- Feels subtle and premium, not cheesy
- Only plays once per window open (tracked by `hasBooted` in store)

### Phase 3 — Deterministic Command System

**Files created:**
- `src/veronica/engine/command-registry.ts` — Singleton registry with `register()`, `lookup()`, `getNames()`
- `src/veronica/engine/command-executor.ts` — Parses input, dispatches to command or fuzzy match
- `src/veronica/engine/fuzzy-match.ts` — Levenshtein distance + `findSimilarCommands()` + `looksLikeCommand()`
- `src/veronica/engine/index.ts` — Barrel export
- `src/veronica/commands/types.ts` — Re-exports command types
- `src/veronica/commands/index.ts` — Auto-registers all commands via side-effect imports

**12 commands implemented:**

| Command | Aliases | Description |
|---------|---------|-------------|
| `help` | `h`, `?` | Lists all commands, or shows help for specific command |
| `about` | `bio`, `info` | Vitthal's bio — role, focus, education |
| `skills` | `tech`, `stack` | Categorized tech stack from existing `techStack` constant |
| `projects` | `ls-projects` | All projects with descriptions and tags |
| `contact` | `email`, `socials` | Email and social links (clickable) |
| `resume` | `cv` | Opens resume window |
| `clear` | `cls` | Clears terminal output |
| `whoami` | | Prints `vitthalganeshshivane` |
| `ls` | `dir` | Virtual filesystem listing |
| `pwd` | | Prints `~/portfolio` |
| `neofetch` | `sysinfo`, `fetch` | ASCII art + system summary |
| `veronica` | `version`, `v` | About Veronica |

**Command suggestion system:**
- Levenshtein distance for fuzzy matching (max distance 2)
- Only triggers for single-word inputs (prevents wasting on natural language)
- Shows up to 3 suggestions as clickable buttons
- Example: `projets` → "Did you mean: projects"

### Phase 5 — AI Architecture Scaffolding

**Files created:**
- `src/veronica/ai/provider.ts` — `AIProviderRegistry` with provider switching, fallback chain, routing
- `src/veronica/ai/prompt-builder.ts` — Builds `AIRequest` with system prompt + history
- `src/veronica/ai/response-formatter.ts` — Converts raw AI text to `TerminalLine[]`, strips markdown
- `src/veronica/ai/providers/openrouter.ts` — `OpenRouterProvider` (OpenAI-compatible, custom model)
- `src/veronica/ai/providers/nvidia-nim.ts` — `NvidiaNimProvider` (NVIDIA-hosted inference)
- `src/veronica/ai/index.ts` — Barrel export

**Environment variables (for future use):**
- `VITE_OPENROUTER_API_KEY` — OpenRouter API key
- `VITE_NVIDIA_NIM_API_KEY` — NVIDIA NIM API key

**Routing architecture:**
- `aiRegistry.setActive(id)` — sets primary provider
- `aiRegistry.setFallbackOrder([...])` — sets fallback chain
- `aiRegistry.route(request)` — tries active, falls back through chain
- Future: route by request type (portfolio → OpenRouter, reasoning → NIM, local → local)

**Not yet wired:** AI calls are not connected to the terminal executor. Natural language input currently shows a placeholder message.

---

## Architecture Decisions

### 1. Separate `veronica/` module

All Veronica internals live under `src/veronica/` with a `#veronica` path alias. This isolates the feature from the existing codebase — no pollution of `lib/`, `hooks/`, or `store/`.

### 2. Separate window key (`'veronica'`)

The existing `'terminal'` key and `Terminal.tsx` are untouched. Veronica gets its own window key, CSS ID, and components.

### 3. Self-registering commands

Each command file calls `registry.register()` at module level. The barrel `commands/index.ts` imports all command files for their side effects. Adding a new command = one file + one import line.

### 4. Discriminated union for terminal lines

`TerminalLine` is a discriminated union with `kind` as the discriminant. The renderer uses exhaustive switch. Adding a new line type is a type-safe change.

### 5. Provider-agnostic AI layer

The `AIProvider` interface is minimal (`name`, `id`, `complete()`). The registry handles routing and fallback. Providers are swappable without touching terminal logic.

### 6. Levenshtein for fuzzy matching

Lightweight, zero-dependency, ~30 lines. Max distance of 2 catches common typos. Only triggers for single-word inputs to avoid false positives on natural language.

---

## Pending Phases

### Phase 5 (Full) — AI Integration
- Wire `aiRegistry.route()` into `command-executor.ts`
- Initialize providers from env vars on app load
- Add conversation history tracking to store
- Handle loading states and errors gracefully

### Phase 6 — Mobile Support
- Test `MobileVeronica` window behavior
- Adjust terminal body for mobile viewport

### Phase 7 — Polish + Advanced
- Streaming AI responses (character-by-character)
- Colored AI output (parse markers)
- Command aliases configuration
- `man` pages for commands
- Easter egg commands

---

## Known Limitations

1. **AI not active** — Natural language input shows a placeholder. Requires API key configuration and provider wiring.
2. **No streaming** — AI responses will render all at once. Streaming is a Phase 7 feature.
3. **No memory** — Terminal state is session-only. Closing the window loses history.
4. **No minimize/maximize** — Same as existing windows (TODOs in WindowControls).
5. **Mobile untested** — `MobileVeronica` created but not yet verified on device.

---

## File Inventory

### Created (30 files)

```
src/veronica/
  index.ts
  types.ts
  constants.ts
  store/
    index.ts
    veronica.ts
  components/
    index.ts
    TerminalBody.tsx
    LineRenderer.tsx
    SegmentRenderer.tsx
    BootSequence.tsx
  engine/
    index.ts
    command-registry.ts
    command-executor.ts
    fuzzy-match.ts
  commands/
    index.ts
    types.ts
    help.ts
    about.ts
    skills.ts
    projects.ts
    contact.ts
    resume.ts
    clear.ts
    whoami.ts
    ls.ts
    pwd.ts
    neofetch.ts
    veronica.ts
  ai/
    index.ts
    provider.ts
    prompt-builder.ts
    response-formatter.ts
    providers/
      openrouter.ts
      nvidia-nim.ts

src/windows/
  Veronica.tsx
  mobile/
    Veronica.tsx
```

### Modified (7 files)

```
src/types/windows.ts         — Added 'veronica' to WindowKey
src/constants/index.ts       — Added veronica to WINDOW_CONFIG + dockApps
src/App.tsx                  — Added lazy imports + conditional render
src/windows/index.ts         — Added barrel exports
src/index.css                — Added #veronica + #mobile-veronica CSS
vite.config.ts               — Added #veronica path alias
tsconfig.app.json            — Added #veronica path mapping
```

---

## Extension Points

### Adding a new command

1. Create `src/veronica/commands/mycommand.ts`
2. Define `CommandDefinition` with `name`, `description`, `execute()`
3. Call `registry.register(myCommand)` at module level
4. Add `import './mycommand'` to `src/veronica/commands/index.ts`

No changes to engine, store, renderer, or window code.

### Adding a new AI provider

1. Create `src/veronica/ai/providers/newprovider.ts` implementing `AIProvider`
2. Register it: `aiRegistry.register(new NewProvider(config))`
3. Update fallback order if needed

No changes to terminal UI, store, or commands.

### Adding a new terminal line type

1. Add to `TerminalLine` union in `types.ts`
2. Add case to `LineRenderer.tsx` switch
3. Use it in any command or AI response formatter

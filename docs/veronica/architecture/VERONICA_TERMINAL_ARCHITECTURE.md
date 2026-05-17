# Veronica Terminal Architecture

## 1. System Overview

Veronica is a terminal-style AI assistant embedded in the macOS portfolio. It is NOT a chatbot. It is an interactive CLI that runs inside a draggable window, visually identical to the existing terminal, using the same window system, fonts, colors, and animation patterns.

The system uses a **hybrid execution model**: deterministic local commands execute instantly for known inputs, while natural language falls through to an abstracted AI service layer.

### Design Principles

1. **Terminal-first** — Every output is CLI-formatted text, never chat bubbles or cards
2. **Existing pattern adherence** — Uses `WindowWrapper`, `WindowControls`, `window-header`, `font-roboto`, `#00A154`
3. **Clean separation** — Command logic, AI logic, and rendering logic are fully decoupled
4. **Provider-agnostic AI** — The AI layer is an interface, not an implementation
5. **Incremental complexity** — Ship deterministic commands first, add AI later

---

## 2. File Structure

```
src/
  windows/
    Veronica.tsx                 # Desktop window component
    mobile/
      Veronica.tsx               # Mobile window component

  veronica/                      # NEW top-level module (all Veronica internals)
    index.ts                     # Barrel exports

    types.ts                     # All Veronica-specific types
    constants.ts                 # Veronica-specific constants (boot messages, prompts, etc.)

    engine/
      index.ts
      command-registry.ts        # Command registration + lookup
      command-executor.ts        # Parses input → dispatches to handler or AI
      command-history.ts         # Arrow-key history ring buffer

    commands/
      index.ts                   # Barrel — auto-registers all commands
      types.ts                   # CommandDefinition interface
      help.ts                    # help command
      about.ts                   # about command
      skills.ts                  # skills command (replaces static tech stack)
      projects.ts                # projects command
      contact.ts                 # contact command
      resume.ts                  # resume command
      clear.ts                   # clear command
      whoami.ts                  # whoami command
      ls.ts                      # ls command
      pwd.ts                     # pwd command
      neofetch.ts                # neofetch-style system info

    ai/
      index.ts                   # Barrel
      provider.ts                # AIProvider interface
      prompt-builder.ts          # System prompt + context formatting
      response-formatter.ts      # Raw AI text → terminal-formatted lines
      providers/
        gemini.ts                # Gemini implementation (future)
        openai.ts                # OpenAI implementation (future)

    store/
      index.ts                   # Barrel
      veronica.ts                # Zustand store for terminal state
```

### Why This Structure

| Directory | Responsibility | Why separate |
|-----------|---------------|-------------|
| `veronica/` | All Veronica internals | Isolates feature from existing codebase; no pollution of `lib/`, `hooks/`, or `store/` |
| `veronica/engine/` | Input parsing, dispatch, history | Core terminal logic that must be UI-agnostic |
| `veronica/commands/` | Individual command handlers | Adding a command = new file, zero core changes |
| `veronica/ai/` | AI abstraction layer | Completely decoupled from terminal rendering |
| `veronica/store/` | Terminal session state | Separate from the global `window.ts` store |
| `veronica/types.ts` | Shared types | Single source of truth for all Veronica data shapes |

The `veronica/` directory sits at `src/veronica/` alongside `src/windows/`, `src/store/`, etc. It gets a `#veronica` path alias.

---

## 3. Window Integration

### Window Key

Veronica uses `'veronica'` as its `WindowKey`. The existing `'terminal'` key and `Terminal.tsx` remain untouched.

### Registration Points

The following existing files need one-line additions each:

| File | Change |
|------|--------|
| `src/types/windows.ts` | Add `'veronica'` to `WindowKey` union |
| `src/constants/index.ts` | Add `veronica` entry to `WINDOW_CONFIG` |
| `src/constants/index.ts` | Add Veronica dock app to `dockApps` array |
| `src/App.tsx` | Add lazy import + conditional rendering block |
| `src/windows/index.ts` | Add barrel export |
| `src/index.css` | Add `#veronica` CSS ID block |

### Window CSS

The `#veronica` CSS block mirrors `#terminal` positioning and styling:

```css
#veronica {
  @apply dark:bg-dark-700 absolute top-32 left-1/12 w-xl rounded-xl bg-white
         shadow-2xl drop-shadow-2xl transition-colors duration-300 max-sm:hidden;

  /* Inherits .window-header, .techstack font-roboto patterns */
  /* Additional terminal-body styles defined here */
}
```

This matches the existing terminal's `top-32 left-1/12 w-xl` placement. The window is taller than the static terminal since it has scrollable output.

### Window Component Pattern

```tsx
// src/windows/Veronica.tsx
const Veronica = (): ReactElement => {
  return (
    <>
      <div className="window-header">
        <WindowControls target="veronica" />
        <h2>Veronica</h2>
        <div className="window-header-spacer" aria-hidden="true" />
      </div>
      <TerminalBody />
    </>
  );
};

const VeronicaWindow = WindowWrapper(Veronica, 'veronica');
export default VeronicaWindow;
```

Follows the exact same pattern as `Terminal.tsx`, `Contact.tsx`, `Finder.tsx`, etc.

---

## 4. Terminal Data Model

### Line Types

Every piece of output in the terminal is a `TerminalLine`. The terminal body is an array of these.

```typescript
// veronica/types.ts

/** Discriminated union for all terminal output line types. */
type TerminalLine =
  | InputLine
  | OutputLine
  | SystemLine
  | ErrorLine
  | LoadingLine;

/** The user's typed command, rendered with the prompt prefix. */
interface InputLine {
  kind: 'input';
  prompt: string;       // e.g. "veronica %"
  text: string;         // the raw command string
}

/** Normal command output — one or more text segments. */
interface OutputLine {
  kind: 'output';
  segments: OutputSegment[];
}

/** System message (boot sequence, info banners). */
interface SystemLine {
  kind: 'system';
  text: string;
}

/** Error message (command not found, API failure). */
interface ErrorLine {
  kind: 'error';
  text: string;
}

/** Loading indicator while waiting for AI response. */
interface LoadingLine {
  kind: 'loading';
}
```

### Output Segments

Output segments allow styled inline content within a single line:

```typescript
interface OutputSegment {
  text: string;
  /** Optional color override — defaults to terminal text color. */
  color?: 'green' | 'red' | 'yellow' | 'blue' | 'muted';
  /** Bold weight for this segment. */
  bold?: boolean;
  /** Makes the segment a clickable link. */
  href?: string;
}
```

Color mapping (preserves existing palette):
- `green` → `text-[#00A154]` (existing terminal accent)
- `red` → `text-red-500`
- `yellow` → `text-yellow-500`
- `blue` → `text-blue-500`
- `muted` → `text-gray-400` / `dark:text-gray-500`

### Why This Model

- **Discriminated union** — `kind` field enables exhaustive switch in the renderer
- **Segment-based output** — Allows mixed styling per line without HTML injection
- **Loading state as a line** — Loading indicator scrolls naturally with output
- **Immutable append** — Lines are never mutated; new lines are appended to the array

---

## 5. Terminal State (Zustand Store)

```typescript
// veronica/store/veronica.ts

interface VeronicaState {
  /** All terminal lines rendered so far. */
  lines: TerminalLine[];
  /** Current value of the input field. */
  input: string;
  /** Whether an AI request is in flight. */
  isLoading: boolean;
  /** Command history ring buffer (newest first). */
  history: string[];
  /** Current position in history (-1 = not browsing). */
  historyIndex: number;

  // Actions
  appendLine: (line: TerminalLine) => void;
  appendLines: (lines: TerminalLine[]) => void;
  clearLines: () => void;
  setInput: (value: string) => void;
  setLoading: (loading: boolean) => void;
  pushHistory: (command: string) => void;
  navigateHistory: (direction: 'up' | 'down') => string | null;
  reset: () => void;
}
```

Uses Zustand + Immer (same pattern as `window.ts` and `location.ts`).

### State Lifecycle

```
User types → setInput(value)
User presses Enter →
  1. pushHistory(input)
  2. appendLine({ kind: 'input', prompt, text: input })
  3. setInput('')
  4. Execute command:
     a. If deterministic → appendLine/appendLines(output)
     b. If AI → setLoading(true) → await AI → appendLines(response) → setLoading(false)
```

### History Ring Buffer

```typescript
const MAX_HISTORY = 100;

pushHistory: (command) => {
  set((state) => {
    // Deduplicate consecutive identical commands
    if (state.history[0] === command) return;
    state.history.unshift(command);
    if (state.history.length > MAX_HISTORY) {
      state.history.pop();
    }
    state.historyIndex = -1;
  });
},

navigateHistory: (direction) => {
  let newIndex: number;
  set((state) => {
    if (direction === 'up') {
      newIndex = Math.min(state.historyIndex + 1, state.history.length - 1);
    } else {
      newIndex = state.historyIndex - 1;
    }
    state.historyIndex = newIndex;
    if (newIndex >= 0) {
      state.input = state.history[newIndex];
    } else {
      state.input = '';
    }
  });
  // Return value is read from the updated state
};
```

---

## 6. Command System Architecture

### Command Definition Interface

```typescript
// veronica/commands/types.ts

interface CommandDefinition {
  /** Primary command name (what the user types). */
  name: string;
  /** Optional aliases (e.g., ['h'] for help). */
  aliases?: string[];
  /** Short description shown in help output. */
  description: string;
  /** Usage string (e.g., 'help [command]'). */
  usage?: string;
  /** The function that executes the command. */
  execute: (args: string[], context: CommandContext) => CommandResult;
}

interface CommandContext {
  /** Access to append output lines. */
  appendLine: (line: TerminalLine) => void;
  /** Access to clear the terminal. */
  clear: () => void;
  /** Open a portfolio window by key. */
  openWindow: (key: WindowKey) => void;
  /** Current window store reference. */
  windows: Record<WindowKey, { isOpen: boolean }>;
}

interface CommandResult {
  /** Lines to render. Empty array = no output (e.g., clear command). */
  lines: TerminalLine[];
  /** If true, the command wants to open a window. */
  openWindow?: WindowKey;
}
```

### Command Registry

```typescript
// veronica/engine/command-registry.ts

class CommandRegistry {
  private commands = new Map<string, CommandDefinition>();
  private aliases = new Map<string, string>();

  register(command: CommandDefinition): void {
    this.commands.set(command.name, command);
    for (const alias of command.aliases ?? []) {
      this.aliases.set(alias, command.name);
    }
  }

  lookup(input: string): { command: CommandDefinition; args: string[] } | null {
    const [name, ...args] = input.trim().split(/\s+/);
    const resolved = this.commands.get(name) ?? this.commands.get(this.aliases.get(name) ?? '');
    if (!resolved) return null;
    return { command: resolved, args };
  }

  getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }
}
```

The registry is a singleton module-level instance. Commands register themselves in their module files.

### Command Registration Pattern

```typescript
// veronica/commands/help.ts
import { registry } from '../engine/command-registry';

const helpCommand: CommandDefinition = {
  name: 'help',
  aliases: ['h', '?'],
  description: 'Show available commands',
  execute: (args, ctx) => {
    if (args[0]) {
      // Show specific command help
      const cmd = registry.lookup(args[0]);
      if (!cmd) return { lines: [{ kind: 'error', text: `help: no help for '${args[0]}'` }] };
      return { lines: [
        { kind: 'output', segments: [{ text: cmd.command.name, bold: true }] },
        { kind: 'output', segments: [{ text: cmd.command.description }] },
        ...(cmd.command.usage ? [{ kind: 'output' as const, segments: [{ text: `Usage: ${cmd.command.usage}`, color: 'muted' as const }] }] : []),
      ]};
    }
    // List all commands
    const all = registry.getAll();
    return { lines: [
      { kind: 'output', segments: [{ text: 'Available commands:', bold: true }] },
      ...all.map(cmd => ({
        kind: 'output' as const,
        segments: [
          { text: `  ${cmd.name.padEnd(12)}`, color: 'green' as const },
          { text: cmd.description },
        ],
      })),
    ]};
  },
};

registry.register(helpCommand);
export default helpCommand;
```

### Command Index (Auto-Registration)

```typescript
// veronica/commands/index.ts
// Import all commands — each module self-registers via registry.register()
import './help';
import './about';
import './skills';
import './projects';
import './contact';
import './resume';
import './clear';
import './whoami';
import './ls';
import './pwd';
import './neofetch';
```

### Command Execution Flow

```
Input string
  → CommandExecutor.execute(rawInput)
    → Parse: extract command name + args
    → CommandRegistry.lookup(name)
      → FOUND: call command.execute(args, context) → return CommandResult
      → NOT FOUND: fall through to AI layer
    → Render result lines into store
```

---

## 7. Deterministic Commands

### Command Catalog

| Command | Aliases | Behavior | Opens Window? |
|---------|---------|----------|---------------|
| `help` | `h`, `?` | List all commands or show specific command help | No |
| `about` | | Print Vitthal's bio (same data as `about-me.txt` Finder file) | No |
| `skills` | `tech`, `stack` | Print categorized tech stack (same data as existing `techStack` constant) | No |
| `projects` | `ls-projects` | List all project names with descriptions | No |
| `contact` | | Print contact info + social links | Optionally opens `contact` window |
| `resume` | | Print resume summary or open resume window | Opens `resume` window |
| `clear` | `cls` | Clear all terminal lines | No |
| `whoami` | | Print `vitthalganeshshivane` | No |
| `ls` | | List virtual filesystem entries (projects, about, resume, etc.) | No |
| `pwd` | | Print `~/portfolio` | No |
| `neofetch` | | ASCII art + system summary (portfolio stats) | No |
| `veronica` | | Print Veronica's identity and version | No |

### Output Formatting Convention

All deterministic commands return `TerminalLine[]`. Formatting follows these rules:

1. **Section headers** — `{ text: 'Section Name', bold: true }`
2. **Labels** — `{ text: '  Label:  ', color: 'green' }` followed by `{ text: 'value' }`
3. **List items** — `{ text: '  - ', color: 'green' }` followed by `{ text: 'item' }`
4. **URLs** — `{ text: 'https://...', color: 'blue', href: 'https://...' }`
5. **Errors** — `{ kind: 'error', text: 'message' }`
6. **System messages** — `{ kind: 'system', text: 'message' }`

---

## 8. AI Service Layer

### Provider Interface

```typescript
// veronica/ai/provider.ts

interface AIProvider {
  /** Human-readable provider name. */
  readonly name: string;
  /** Send a prompt and get a response. */
  complete(request: AIRequest): Promise<AIResponse>;
}

interface AIRequest {
  /** The user's raw input. */
  userMessage: string;
  /** Formatted system prompt with portfolio context. */
  systemPrompt: string;
  /** Recent conversation history for context. */
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface AIResponse {
  /** The AI's text response. */
  text: string;
  /** Token usage if available. */
  usage?: { prompt: number; completion: number };
}
```

### Prompt Builder

```typescript
// veronica/ai/prompt-builder.ts

const SYSTEM_PROMPT = `You are Veronica, a terminal-based AI assistant inside Vitthal Ganesh Shivane's portfolio website.

You run inside a terminal window styled like macOS. You MUST:
- Respond in CLI-formatted text, not prose
- Be concise, direct, and technical
- Use short lines, bullet points, and clear structure
- Never use markdown headers, bold (**), or chat-style formatting
- Never break the terminal illusion — you are a system tool, not a chatbot
- Prefix responses with brief context when relevant

Portfolio context:
- Owner: Vitthal Ganesh Shivane
- Role: Aspiring Software Engineer, MERN Stack Developer
- Education: BTech CSE (2023-2026), Diploma in Mechanical Engineering
- Projects: DocSpace, Writeflow, MindGuard, Vroom45, Digital Classroom
- Skills: React, JavaScript, Node.js, Express.js, MongoDB, Tailwind CSS, Git
- Contact: vitthalganeshshivane@gmail.com
- GitHub: github.com/vitthalganeshshivane

When asked about something not related to the portfolio, respond briefly and redirect.`;

function buildRequest(userMessage: string, history: string[]): AIRequest {
  return {
    userMessage,
    systemPrompt: SYSTEM_PROMPT,
    history: formatHistory(history),
  };
}
```

### Response Formatter

```typescript
// veronica/ai/response-formatter.ts

function formatAIResponse(rawText: string): TerminalLine[] {
  return rawText
    .split('\n')
    .filter(line => line.trim() !== '')
    .map(line => ({
      kind: 'output' as const,
      segments: [{ text: line }],
    }));
}
```

The formatter strips excessive whitespace, converts the AI's response into clean terminal lines. Future versions can parse special markers for colored segments.

### Provider Implementations (Future)

```typescript
// veronica/ai/providers/gemini.ts
export class GeminiProvider implements AIProvider {
  readonly name = 'Gemini';

  async complete(request: AIRequest): Promise<AIResponse> {
    // Implementation uses @google/generative-ai SDK
    // API key from environment variable
    // Returns formatted response
  }
}
```

The provider is selected via a simple factory or config constant. Swapping providers changes one import.

### AI Fallback Flow

```
CommandRegistry.lookup(input) returns null
  → Check: is this a short, command-like input? (single word, starts with known prefix)
    → YES: return "command not found" error
    → NO: treat as natural language
  → AIProvider.complete(buildRequest(input, recentHistory))
  → formatAIResponse(response.text)
  → appendLines to store
```

The heuristic for "command-like vs natural language" prevents wasting API calls on typos:

```typescript
function looksLikeCommand(input: string): boolean {
  const trimmed = input.trim();
  // Single word with no spaces = likely a mistyped command
  return !trimmed.includes(' ') && trimmed.length < 20;
}
```

---

## 9. Input Handling

### Input Component

The terminal input is a styled `<input>` element positioned at the bottom of the terminal body, always visible. It follows the Safari `.search` input pattern for styling consistency.

```tsx
// Inside TerminalBody component
<div className="terminal-input-line">
  <span className="terminal-prompt">veronica %</span>
  <input
    ref={inputRef}
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyDown={handleKeyDown}
    className="terminal-input"
    autoFocus
    spellCheck={false}
    autoComplete="off"
  />
</div>
```

### Keyboard Handling

```typescript
function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
  switch (e.key) {
    case 'Enter':
      e.preventDefault();
      executeCommand(input);
      break;
    case 'ArrowUp':
      e.preventDefault();
      navigateHistory('up');
      break;
    case 'ArrowDown':
      e.preventDefault();
      navigateHistory('down');
      break;
    case 'l':
      if (e.ctrlKey) {
        e.preventDefault();
        clearLines();
      }
      break;
    case 'c':
      if (e.ctrlKey) {
        e.preventDefault();
        setInput('');
        appendLine({ kind: 'system', text: '^C' });
      }
      break;
  }
}
```

### Auto-Scroll

When new lines are appended, the terminal body auto-scrolls to the bottom. This uses a `useEffect` that scrolls the container ref when `lines.length` changes:

```typescript
useEffect(() => {
  containerRef.current?.scrollTo({
    top: containerRef.current.scrollHeight,
    behavior: 'smooth',
  });
}, [lines.length]);
```

### Auto-Focus

The input field receives focus when:
1. The window opens (via `useEffect` on `isOpen`)
2. The user clicks anywhere in the terminal body
3. The window receives focus via `focusWindow()`

---

## 10. Rendering Pipeline

### Terminal Body Component

```
TerminalBody
  ├── Boot sequence (rendered once on first mount)
  ├── Scrollable output area
  │   └── lines.map(line => <TerminalLineRenderer />)
  ├── Loading indicator (when isLoading)
  └── Input line (always at bottom)
```

### Line Renderer

```typescript
function TerminalLineRenderer({ line }: { line: TerminalLine }) {
  switch (line.kind) {
    case 'input':
      return (
        <p className="terminal-line terminal-input-echo">
          <span className="terminal-prompt">{line.prompt}</span>
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
      return <LoadingDots />;
  }
}
```

### Segment Renderer

```typescript
function SegmentRenderer({ segment }: { segment: OutputSegment }) {
  const colorClass = segment.color ? COLOR_MAP[segment.color] : '';
  const className = clsx(colorClass, segment.bold && 'font-bold');

  if (segment.href) {
    return <a href={segment.href} target="_blank" rel="noopener noreferrer" className={clsx(className, 'underline')}>{segment.text}</a>;
  }

  return <span className={className}>{segment.text}</span>;
}
```

### Loading Indicator

A minimal animated dots indicator, styled with the terminal font:

```typescript
function LoadingDots() {
  return (
    <p className="terminal-line terminal-loading">
      <span className="animate-pulse">thinking...</span>
    </p>
  );
}
```

Uses Tailwind's `animate-pulse` — no custom animation needed.

### Boot Sequence

On first mount, the terminal displays a brief boot sequence:

```
Veronica Terminal v1.0
Type 'help' for available commands.

veronica %
```

This is rendered as initial `SystemLine` entries appended once via `useEffect`.

---

## 11. CSS Styling Specification

All styles are added to `src/index.css` inside `@layer components`.

### Desktop `#veronica` Block

```css
#veronica {
  @apply dark:bg-dark-700 absolute top-32 left-1/12 w-xl rounded-xl bg-white
         shadow-2xl drop-shadow-2xl transition-colors duration-300 max-sm:hidden;

  h2 {
    @apply w-full text-center text-sm font-bold;
  }

  .terminal-body {
    @apply font-roboto p-5 text-sm text-black dark:text-white;
    min-height: 400px;
    max-height: calc(82vh - 52px); /* subtract header height */
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .terminal-line {
    @apply leading-relaxed;
    min-height: 1.5rem;
  }

  .terminal-input-line {
    @apply flex items-center gap-2 mt-2;
  }

  .terminal-prompt {
    @apply font-bold text-[#00A154] shrink-0;
  }

  .terminal-input {
    @apply flex-1 bg-transparent outline-none text-sm font-roboto
           text-black dark:text-white caret-[#00A154];
  }

  .terminal-system {
    @apply text-gray-400 dark:text-gray-500;
  }

  .terminal-error {
    @apply text-red-500;
  }

  .terminal-loading {
    @apply text-gray-400 dark:text-gray-500;
  }
}
```

### Color Mapping Constants

```typescript
const COLOR_MAP: Record<string, string> = {
  green: 'text-[#00A154]',
  red: 'text-red-500',
  yellow: 'text-yellow-500',
  blue: 'text-blue-500',
  muted: 'text-gray-400 dark:text-gray-500',
};
```

### Consistency Checklist

- Font: `font-roboto` (matches existing terminal)
- Prompt color: `text-[#00A154]` (matches existing terminal green)
- Prompt format: `veronica %` (matches `@vitthalganeshshivane %` pattern)
- Background: `bg-white dark:bg-dark-700` (matches all windows)
- Shadow: `shadow-2xl drop-shadow-2xl` (matches all windows)
- Border radius: `rounded-xl` (matches all windows)
- Text size: `text-sm` (matches existing terminal)
- Line height: `leading-relaxed` (matches mobile terminal)

---

## 12. State Persistence Strategy

### Session-Only (Default)

By default, terminal state is ephemeral. When the window closes and reopens:
- Lines are cleared (fresh boot sequence)
- History is cleared
- Input is cleared

This matches real terminal behavior — closing a terminal window loses the session.

### Future: localStorage Persistence

If desired later, the store can be extended with `persist` middleware:

```typescript
const useVeronicaStore = create<VeronicaState>()(
  persist(
    immer((set) => ({ /* ... */ })),
    { name: 'veronica-session', partialize: (s) => ({ history: s.history }) },
  ),
);
```

Only `history` should persist — not `lines` (stale output on reopen feels broken).

---

## 13. Performance Considerations

1. **Lazy loading** — `Veronica.tsx` is lazy-loaded via `React.lazy()` like all windows
2. **Line virtualization** — NOT needed initially. Terminal output is text, not images. React handles hundreds of `<p>` elements fine. Add virtualization only if output exceeds ~500 lines.
3. **AI request debouncing** — Not needed for Enter-key submit. Future streaming will use `AbortController` to cancel stale requests.
4. **History size cap** — Ring buffer capped at 100 entries prevents unbounded memory growth.
5. **Re-render scope** — The store uses `useShallow` selectors. Each line renderer only re-renders when its specific line changes (Immer structural sharing).
6. **AI response size** — System prompt instructs concise responses. Response formatter strips empty lines.

---

## 14. Implementation Roadmap

### Phase 1: Window Shell + Static Output

**Files to create:**
- `src/veronica/types.ts`
- `src/veronica/constants.ts`
- `src/windows/Veronica.tsx`
- `src/index.css` — add `#veronica` block

**Files to modify:**
- `src/types/windows.ts` — add `'veronica'` to `WindowKey`
- `src/constants/index.ts` — add to `WINDOW_CONFIG` + `dockApps`
- `src/App.tsx` — add lazy import + conditional render
- `src/windows/index.ts` — add barrel export
- `vite.config.ts` — add `#veronica` alias
- `tsconfig.app.json` — add `#veronica` path

**Outcome:** Veronica appears in dock, opens a draggable window with a static boot message. No interactivity yet.

**Why first:** Validates window integration, CSS consistency, and build configuration before any logic.

### Phase 2: Terminal Body + Input + Rendering

**Files to create:**
- `src/veronica/store/veronica.ts` — Zustand store
- `src/veronica/components/TerminalBody.tsx` — output + input
- `src/veronica/components/LineRenderer.tsx` — line rendering
- `src/veronica/components/SegmentRenderer.tsx` — segment rendering

**Outcome:** Interactive terminal with typed input, Enter to submit, output rendering, auto-scroll. Input echoes back as a prompt line. No commands yet — all input produces "command not found".

**Why second:** Core rendering pipeline must work before adding commands. Isolates UI bugs from logic bugs.

### Phase 3: Command Engine + Static Commands

**Files to create:**
- `src/veronica/engine/command-registry.ts`
- `src/veronica/engine/command-executor.ts`
- `src/veronica/commands/types.ts`
- `src/veronica/commands/index.ts`
- `src/veronica/commands/help.ts`
- `src/veronica/commands/about.ts`
- `src/veronica/commands/skills.ts`
- `src/veronica/commands/projects.ts`
- `src/veronica/commands/contact.ts`
- `src/veronica/commands/resume.ts`
- `src/veronica/commands/clear.ts`
- `src/veronica/commands/whoami.ts`
- `src/veronica/commands/ls.ts`
- `src/veronica/commands/pwd.ts`
- `src/veronica/commands/neofetch.ts`

**Outcome:** Fully functional deterministic terminal. All commands produce styled output. `clear` resets the screen. `resume` opens the resume window. `help` lists all commands.

**Why third:** This is the core value — a working terminal with portfolio-specific commands. No AI dependency.

### Phase 4: Command History

**Files to modify:**
- `src/veronica/store/veronica.ts` — add history ring buffer
- `src/veronica/components/TerminalBody.tsx` — add arrow key handling

**Outcome:** Arrow up/down cycles through previous commands. Ctrl+C clears input. Ctrl+L clears screen.

**Why fourth:** History is a UX enhancement, not a correctness requirement. Adding it after commands work means the feature is testable.

### Phase 5: AI Integration

**Files to create:**
- `src/veronica/ai/provider.ts`
- `src/veronica/ai/prompt-builder.ts`
- `src/veronica/ai/response-formatter.ts`
- `src/veronica/ai/providers/gemini.ts` (or chosen provider)
- `src/veronica/engine/command-executor.ts` — add AI fallback path

**Files to modify:**
- `src/veronica/store/veronica.ts` — add `isLoading` state
- `src/veronica/components/TerminalBody.tsx` — add loading indicator

**Outcome:** Natural language input falls through to AI. Responses render as terminal-formatted lines. Loading indicator shows during API call.

**Why fifth:** AI is the most complex and external-dependency-heavy feature. Everything else must be solid first.

### Phase 6: Mobile Support

**Files to create:**
- `src/windows/mobile/Veronica.tsx`

**Files to modify:**
- `src/App.tsx` — add mobile conditional render

**Outcome:** Veronica works on mobile with `MobileWindowWrapper` pattern.

**Why sixth:** Desktop-first, mobile is a polish pass.

### Phase 7: Polish + Advanced Features

- Streaming AI responses (character-by-character rendering)
- Command autocomplete (Tab key)
- Command aliases configuration
- Colored AI output (parse markers from AI response)
- Clickable links in output
- `man` pages for commands
- Easter egg commands

---

## 15. Scalability Considerations

### Adding a New Command

1. Create `src/veronica/commands/newcommand.ts`
2. Define `CommandDefinition` with `name`, `description`, `execute`
3. Call `registry.register(newCommand)` in the module
4. Add `import './newcommand'` to `src/veronica/commands/index.ts`

No changes to engine, store, renderer, or window code.

### Swapping AI Provider

1. Create `src/veronica/ai/providers/newprovider.ts` implementing `AIProvider`
2. Update the provider import in `command-executor.ts`

No changes to terminal UI, store, or commands.

### Adding Output Formatting

The `OutputSegment` type is extensible. Adding a new color or style:

1. Add to the `color` union type in `OutputSegment`
2. Add the Tailwind class to `COLOR_MAP`

No changes to the rendering pipeline.

### Multiple Terminal Windows

The architecture supports multiple independent terminal instances by parameterizing the store key. Not needed now, but the design doesn't prevent it.

---

## 16. Dependency Requirements

### New Packages

| Package | Purpose | When to install |
|---------|---------|-----------------|
| `@google/generative-ai` | Gemini API client | Phase 5 (AI integration) |

No other packages are needed. The terminal engine, command system, and rendering pipeline are built with React + Zustand + Tailwind only.

### Existing Package Usage

| Package | Used for |
|---------|----------|
| `zustand` + `immer` | Terminal state store |
| `clsx` | Conditional classnames in renderers |
| `lucide-react` | Icons in terminal output (Check, etc.) |
| `@gsap/react` | Not directly used (WindowWrapper handles animation) |

---

## 17. Consistency Rules Summary

### DO

- Use `WindowWrapper` HOC for the desktop window
- Use `MobileWindowWrapper` HOC for the mobile window
- Use `WindowControls` in the header
- Use `window-header` + `window-header-spacer` pattern
- Use `font-roboto` for all terminal content
- Use `#00A154` as the prompt/accent color
- Use `text-sm` for terminal text
- Use `bg-white dark:bg-dark-700` for the window background
- Use `shadow-2xl drop-shadow-2xl` for the window shadow
- Use `rounded-xl` for the window border radius
- Use `transition-colors duration-300` on the window container
- Use Zustand + Immer for state management
- Use discriminated unions for terminal line types
- Use `satisfies` for type-checked constants

### DON'T

- Don't use chat bubbles, message cards, or SaaS-style UI
- Don't introduce colors outside the existing palette
- Don't modify the existing `Terminal.tsx` or `mobile/Terminal.tsx`
- Don't couple AI logic to terminal rendering
- Don't add packages beyond what's needed
- Don't create abstractions beyond the project's complexity level
- Don't use inline styles — use Tailwind classes or CSS layer classes
- Don't break the `max-sm:hidden` / `sm:hidden` responsive split

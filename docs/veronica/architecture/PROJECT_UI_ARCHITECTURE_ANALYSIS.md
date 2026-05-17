# Project UI Architecture Analysis

## Project Overview

- **Framework**: React 19 + TypeScript 5.9
- **Build Tool**: Vite 7 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite` plugin) + `tw-animate-css`
- **State Management**: Zustand 5 with Immer middleware
- **Animation**: GSAP 3 + `@gsap/react` (useGSAP hook) + GSAP Draggable
- **Icons**: Lucide React (component-based SVG icons)
- **UI Primitives**: Radix UI (`@radix-ui/react-dropdown-menu`)
- **Utilities**: `clsx` for conditional classnames, `dayjs` for time, `react-tooltip`, `react-pdf`
- **Path Aliases**: `#components`, `#constants`, `#hooks`, `#store`, `#hoc`, `#lib`, `#windows`, `#types`

## Architecture

### Directory Structure

```
src/
  App.tsx              # Root component — conditional window rendering
  main.tsx             # Entry point (StrictMode)
  index.css            # Global styles, Tailwind theme, component layers
  components/          # Shared UI components (Navbar, Dock, Home, Welcome, etc.)
    mobile/            # Mobile-specific variants of shared components
    ui/                # Radix-based primitive components (dropdown-menu)
  constants/           # All static data (nav links, dock apps, blog posts, tech stack, finder locations, gallery)
  hoc/                 # Higher-order components (WindowWrapper, MobileWindowWrapper)
  hooks/               # Custom hooks (useCurrentTime, useIsMobile, useContainerWidth)
  lib/                 # Utility modules (gsap setup, pdf worker, bookmark utils, safari address parser)
  store/               # Zustand stores (window, theme, location)
  types/               # TypeScript types and runtime guards
  windows/             # Window content components (one per app)
    mobile/            # Mobile-specific window variants
    mobile/file/       # Mobile file viewer variants (Image, Text)
```

### Path Alias System

All internal imports use `#`-prefixed aliases defined in `vite.config.ts` and `tsconfig.app.json`:

| Alias | Maps To |
|-------|---------|
| `#components` | `src/components` |
| `#constants` | `src/constants` |
| `#hooks` | `src/hooks` |
| `#store` | `src/store` |
| `#hoc` | `src/hoc` |
| `#lib` | `src/lib` |
| `#windows` | `src/windows` |
| `#types` | `src/types` |

### Barrel Export Pattern

Every directory has an `index.ts` barrel file. Components, hooks, stores, types, and hoc all re-export from their respective `index.ts`.

---

## Design Language

### Color System

**Light Mode:**
- Backgrounds: `bg-white`, `bg-gray-50`, `bg-gray-100`, `bg-gray-200`
- Text: `text-black`, `text-gray-400`, `text-gray-500`, `text-gray-700`, `text-gray-800`
- Accents: `text-blue-500`, `text-blue-600`, `text-blue-700`, `bg-blue-100`, `bg-blue-500`
- Status: `#ff6157` (close/red), `#ffc030` (minimize/yellow), `#2acb42` (maximize/green)
- Terminal accent: `#00A154` (green for tech stack items)

**Dark Mode (`.dark` class on root):**
- Backgrounds: `dark:bg-dark-700` (`#1e1e1e`), `dark:bg-dark-300` (`#323232`), `dark:bg-dark-500` (`rgba(30,30,30,0.8)`)
- Text: `dark:text-white`, `dark:text-gray-200`, `dark:text-gray-300`, `dark:text-gray-400`
- Hover: `dark:hover:bg-dark-500`, `dark:bg-dark-800` (`rgba(255,255,255,0.1)`)
- Borders: `dark:border-dark-300`, `dark:border-dark-500`

**Theme Token Variables (CSS custom properties in `@theme`):**
```
--color-dark-800: rgba(255, 255, 255, 0.1)
--color-dark-700: #1e1e1e
--color-dark-500: rgba(30, 30, 30, 0.8)
--color-dark-300: #323232
--color-dark-100: rgba(255, 255, 255, 0.25)
```

### Typography

- **Primary Font**: `Georama` (variable font, weights 100-900, used for headings and UI)
  - Tailwind token: `font-georama`
- **Monospace Font**: `Roboto Mono` (used for terminal/tech stack content)
  - Tailwind token: `font-roboto`
- **Font Sizes**: `text-xs` (11px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px), `text-xl` (20px)
- **Large Display**: `text-7xl` (mobile), `text-9xl` (desktop) for Welcome hero

### Spacing Conventions

- Window padding: `p-5` (20px) for content areas
- Navbar padding: `p-2 px-5`
- Dock padding: `p-1.5` inner, `px-5` outer
- Gap patterns: `gap-1.5`, `gap-2`, `gap-3`, `gap-5`
- Section spacing: `space-y-3`, `space-y-5`

### Shadow & Border Patterns

- **Window shadows**: `shadow-2xl drop-shadow-2xl` — applied to ALL desktop windows
- **Window borders**: `rounded-xl` (12px) for all desktop windows
- **Window header border**: `border-b border-gray-200` (light), `dark:border-dark-300` (dark)
- **Dropdown shadows**: `shadow-md`
- **Dock**: `rounded-2xl bg-white/20 backdrop-blur-md`
- **Navbar**: `bg-white/50 backdrop-blur-3xl` (light), `dark:bg-dark-700/50` (dark)
- **Tooltip**: `!rounded-md !bg-blue-200 !shadow-2xl`

### Glassmorphism / macOS Patterns

- **Navbar**: `bg-white/50 backdrop-blur-3xl` with `select-none`
- **Dock**: `bg-white/20 backdrop-blur-md` with `rounded-2xl`
- **Mobile navbar**: `bg-white/90 backdrop-blur-md` when opaque
- **Mobile window header**: `bg-white/90 backdrop-blur-md`

### Animation Philosophy

- **Window open**: GSAP `fromTo` with `{ scale: 0.8, opacity: 0, y: 40 }` → `{ scale: 1, opacity: 1, y: 0 }`, duration `0.4s`, ease `power3.out`
- **Dock magnification**: Gaussian falloff `exp(-(distance^2.75 / 20000))`, scale up to `1.25`, y shift up to `-15px`, duration `0.2s`, ease `power1.out`
- **Dock reset**: scale back to `1`, y to `0`, duration `0.3s`, ease `power2.out`
- **Welcome text hover**: Variable font weight animation via GSAP, Gaussian falloff, duration `0.25s`, ease `power2.out`
- **Theme switching**: CSS transition `260ms ease` on `background-color, border-color, color, fill, stroke, box-shadow`
- **Gallery items**: `hover:scale-[1.01] active:scale-[0.99]`, duration `300ms`
- **Contact cards**: `hover:-translate-y-0.5 hover:scale-105`, duration `300ms`
- **Sidebar transitions**: `transition-[width] duration-200`

---

## Component Architecture

### Window System

#### WindowWrapper HOC (`src/hoc/WindowWrapper.tsx`)

The core abstraction for ALL desktop windows. Wraps any component with:

1. **Open/close animation** — GSAP scale+opacity+translate entrance
2. **Draggable behavior** — GSAP Draggable, triggered from `.window-header` element
3. **Z-index focus management** — `focusWindow()` on pointer down to bring window to front
4. **Responsive guard** — Returns `null` on mobile (`< 640px`)
5. **CSS ID binding** — Sets `id={windowKey}` on the `<section>` wrapper

**Usage pattern (every desktop window follows this):**
```tsx
const MyWindow = (): ReactElement => { /* content */ };
const MyWindowWrapper = WindowWrapper(MyWindow, 'windowKey');
export default MyWindowWrapper;
```

The wrapper renders:
```tsx
<section id={windowKey} ref={ref} onPointerDown={() => focusWindow(windowKey)}
  style={{ zIndex, display: isOpen ? undefined : 'none' }}
  className="desktop-window absolute">
  <Component {...props} />
</section>
```

#### MobileWindowWrapper HOC (`src/hoc/MobileWindowWrapper.tsx`)

Mobile counterpart. Wraps with:
1. **Responsive guard** — Returns empty fragment on desktop (`>= 640px`)
2. **Open guard** — Returns empty fragment when window is closed
3. **CSS ID binding** — Sets `id={`mobile-${windowKey}`}`

#### Window Content Pattern

Every window component follows this structure:
```tsx
<>
  <div className="window-header">
    <WindowControls target="windowKey" />
    <h2>Title</h2>
    <div className="window-header-spacer" aria-hidden="true" />
  </div>
  {/* Window body content */}
</>
```

### Window Controls (`src/components/WindowControls.tsx`)

Three colored circles (close=red, minimize=yellow, maximize=green), each `size-3.5` (14px), `rounded-full`, with `gap-2` spacing. Only close is functional; minimize and maximize are disabled with TODOs.

### Window Header

- Desktop: `window-header` class — `flex items-center justify-between rounded-t-lg border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-400`
- Sticky positioning: `sticky top-0 z-30` within `.desktop-window`
- Spacer pattern: `window-header-spacer` — `h-3.5 w-[3.625rem]` to balance the controls area

### Desktop Windows (all 8)

| Window Key | Component | Position | Size |
|-----------|-----------|----------|------|
| `finder` | `Finder.tsx` | `top-20 left-40` | `h-[78vh] w-3xl` |
| `safari` | `Safari.tsx` | `top-40 left-2/12` | `h-[78vh] w-4xl` |
| `terminal` | `Terminal.tsx` | `top-32 left-1/12` | `w-xl` |
| `contact` | `Contact.tsx` | `top-60 left-5/12` | `max-w-2xl` |
| `photos` | `Photos.tsx` | `top-96 left-1/2 -translate-y-1/2` | `h-[78vh] w-[min(80vw,56rem)]` |
| `resume` | `Resume.tsx` | `top-16 left-7/12` | `h-[78vh] w-[min(72vw,56rem)]` |
| `txtfile` | `Text.tsx` | `top-36 right-32` | `w-md` |
| `imgfile` | `ImageFile.tsx` | `top-20 left-1/2 -translate-x-1/2` | `h-[78vh] w-[min(86vw,72rem)]` |

All desktop windows share: `absolute`, `rounded-xl`, `bg-white`, `dark:bg-dark-700`, `shadow-2xl`, `drop-shadow-2xl`, `transition-colors duration-300`, `max-sm:hidden`.

### Mobile Windows

All mobile windows share the pattern:
```tsx
<section id={`mobile-${windowKey}`}
  className="absolute top-[var(--mobile-navbar-height)] z-[var(--z-mobile-window)]
    h-[calc(100dvh-var(--mobile-navbar-height))] w-screen overflow-y-auto
    bg-white dark:bg-dark-700 transition-colors duration-300 select-none sm:hidden">
```

Mobile window header: `MobileWindowHeader` component with back button, centered title, spacer.

### Window Store (`src/store/window.ts`)

Zustand + Immer store managing all 8 windows:
- `openWindow(key, data?)` — sets `isOpen=true`, assigns next z-index
- `closeWindow(key)` — sets `isOpen=false`, resets z-index, clears data
- `focusWindow(key)` — bumps z-index for open windows only
- Monotonic z-index: starts at `INITIAL_Z_INDEX` (1000), increments on every open/focus

### Window Data Flow

Windows that need data (txtfile, imgfile) receive it via `window.data` in the store:
```tsx
const data = useWindowStore((state) => state.windows.txtfile.data);
if (!isFinderTextFile(data)) return null; // runtime guard
```

### App.tsx Rendering Pattern

```tsx
{openWindows.terminal ? (
  <Suspense fallback={null}>
    {isMobile ? <MobileTerminal /> : <Terminal />}
  </Suspense>
) : null}
```

All windows are lazy-loaded with `React.lazy()` and wrapped in `<Suspense fallback={null}>`.

---

## Existing Terminal System Analysis

### Desktop Terminal (`src/windows/Terminal.tsx`)

**Structure:**
```
<>
  <div className="window-header">
    <WindowControls target="terminal" />
    <h2>Tech Stack</h2>
    <div className="window-header-spacer" />
  </div>
  <div className="techstack">
    <p> @vitthalganeshshivane % show tech stack </p>
    <div className="label"> Category | Technologies </div>
    <ul className="content">
      {techStack.map => <li> <Check> <h3>category</h3> <ul>items</ul> </li> }
    </ul>
    <div className="footnote">
      <p>loaded count</p>
      <p>render time</p>
    </div>
  </div>
</>
```

**Key styling details:**
- Container: `#terminal` — `w-xl`, `rounded-xl`, `bg-white`, `dark:bg-dark-700`
- Font: `font-roboto` (Roboto Mono)
- Prompt line: `font-bold` for `@vitthalganeshshivane %`, normal for command
- Category header: `ms-10 mt-7`, `w-32`, `font-semibold`, color `#00A154`
- Check icon: `w-5 text-[#00A154]` (Lucide `Check` component)
- Content area: `my-5 space-y-1 border-y border-dashed py-5`
- Tech items: `flex items-center gap-3`
- Footnote: `space-y-2 text-[#00A154]`, uses `Check` and `Flag` icons

**Data source:** `techStack` array from `#constants` — array of `{ category: string, items: string[] }`

**No interactivity:** Static display, no input field, no command processing, no animations.

### Mobile Terminal (`src/windows/mobile/Terminal.tsx`)

Same data, slightly different layout:
- Uses `MobileWindowHeader` with title "Terminal"
- Prompt: `@brandon %` (note: different username than desktop)
- Categories use `ChevronRight` instead of `Check`
- Items listed vertically with `ms-7 mt-2` indentation
- Same footnote pattern

---

## Reusable Systems

### Custom Hooks

| Hook | Purpose |
|------|---------|
| `useCurrentTime()` | Returns `Dayjs` instance, updates every minute aligned to minute boundary |
| `useIsMobile()` | Returns `boolean`, matches `(max-width: 639px)` media query |
| `useContainerWidth(init)` | Returns `[ref, width]`, tracks element width via ResizeObserver |

### CSS Utility Classes (defined in `index.css`)

```css
@utility flex-center  { flex items-center justify-center }
@utility col-center   { flex flex-col items-center justify-center }
@utility abs-center   { absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 }
```

### Component CSS Classes (defined in `@layer components`)

| Class | Purpose |
|-------|---------|
| `.icon` / `.icon-hover` | Rounded hover state for icon buttons |
| `.window-controls` | Traffic light button container |
| `.window-header` | Standard window header bar |
| `.desktop-window` | Max height + overflow for desktop windows |
| `.window-header-spacer` | Balance spacer opposite controls |
| `.window-header-actions` | Right-side action buttons area |
| `.mobile-window-header` | Mobile sticky header with back button |
| `.theme-menu` / `.theme-trigger` / `.theme-items` / `.theme-item` | Theme dropdown system |

### Z-Index Scale

```
--z-navbar: 1000
--z-theme-menu: 1100
--z-theme-dropdown: 1200
--z-mobile-navbar: 10000
--z-mobile-window: 60
```

Windows use dynamic z-index from the store (starting at 1000, incrementing).

---

## UI Consistency Rules

### Window Construction Rules

1. **ALWAYS** use `WindowWrapper` HOC for desktop windows, `MobileWindowWrapper` for mobile
2. **ALWAYS** include `<WindowControls target="windowKey" />` in the header
3. **ALWAYS** use the `window-header` class for the header bar
4. **ALWAYS** include `window-header-spacer` after the title for visual balance
5. **ALWAYS** add the window to `WindowKey` type union, `WINDOW_CONFIG`, and `App.tsx` conditional rendering
6. Desktop windows MUST have: `absolute`, `rounded-xl`, `bg-white`, `dark:bg-dark-700`, `shadow-2xl`, `drop-shadow-2xl`
7. Mobile windows MUST use the standard mobile positioning: `top-[var(--mobile-navbar-height)]`, `z-[var(--z-mobile-window)]`, `h-[calc(100dvh-var(--mobile-navbar-height))]`

### Styling Rules

1. **NEVER** use hardcoded colors — use Tailwind classes or the `--color-dark-*` tokens
2. **ALWAYS** include dark mode variants for every color/background
3. **ALWAYS** use `transition-colors duration-300` on window containers
4. **ALWAYS** use `select-none` on interactive shell elements (navbar, dock, windows)
5. Use `font-georama` for UI text, `font-roboto` for terminal/code content
6. Use `text-sm` (14px) as the standard text size for window content
7. Use `gap-2` or `gap-3` for icon spacing, `gap-5` for section spacing
8. Use `p-5` for window content padding
9. Use `rounded-xl` for windows, `rounded-lg` for window headers, `rounded-md` for small elements

### Animation Rules

1. Window entrance: GSAP `fromTo` — scale 0.8→1, opacity 0→1, y 40→0, 0.4s `power3.out`
2. Hover effects: Use `transition-all duration-300` for CSS-based hover
3. Interactive scale: `hover:scale-[1.01]` or `hover:scale-105` for cards
4. Backdrop blur: `backdrop-blur-md` for overlays, `backdrop-blur-3xl` for navbar

### Icon Rules

1. Use Lucide React components for functional icons (Check, Flag, Search, ChevronLeft, etc.)
2. Use static SVG files in `/icons/` for nav status icons
3. Use static PNG files in `/images/` for app icons (dock, finder, desktop)
4. Icon hover state: `icon` or `icon-hover` CSS class
5. Icon size: `size-4` for inline, `size-5` for standalone, `size-14` for dock icons

### Data Pattern

1. All static content lives in `src/constants/index.ts`
2. Types for constant data live in `src/types/constants.ts`
3. Runtime type guards live in `src/types/guards.ts`
4. Use `satisfies` keyword for type-checked constant arrays

---

## Recommendations For Future Features

### Adding a New Window

1. Add the window key to `WindowKey` type in `src/types/windows.ts`
2. Add default state to `WINDOW_CONFIG` in `src/constants/index.ts`
3. Create `src/windows/NewWindow.tsx` using the standard structure:
   - Import `WindowControls` from `#components`
   - Import `WindowWrapper` from `#hoc`
   - Build content with `window-header` + body pattern
   - Export default as `WindowWrapper(Component, 'newKey')`
4. Create `src/windows/mobile/NewWindow.tsx` using `MobileWindowWrapper`
5. Add lazy imports and conditional rendering in `App.tsx`
6. Add to `src/windows/index.ts` barrel

### Adding a New Dock Icon

1. Add entry to `dockApps` array in `src/constants/index.ts`
2. Place icon PNG in `public/images/`
3. If `canOpen: true`, the `id` must match a `WindowKey`

### Terminal / Chatbot Integration Considerations

The current terminal is a **static display** — it has no input field, no command history, no interactive state. To add chatbot functionality:

1. **Preserve the existing terminal** — it should remain as-is for the tech stack display
2. **New window key** — Use a separate window key (e.g., `'chatbot'`) rather than modifying the existing terminal
3. **Follow the WindowWrapper pattern** exactly for drag, focus, animation
4. **Use `font-roboto`** for any terminal/chat content to match the existing terminal aesthetic
5. **Use `#00A154`** as the terminal green accent color
6. **Use the standard `window-header` pattern** with WindowControls
7. **Match the `#terminal` CSS ID styling** for the container — `w-xl`, `rounded-xl`, same shadows
8. **For chat message bubbles**, follow the existing color palette — avoid introducing new colors
9. **For input fields**, follow the Safari address bar pattern (`.search` class) as a reference for styled inputs
10. **State management** — use Zustand for any chat state, following the existing store patterns with Immer

### Responsive Strategy

- Desktop: `>= 640px` (sm breakpoint) — floating draggable windows
- Mobile: `< 640px` — full-screen windows with mobile navbar and back button
- Use `useIsMobile()` hook or `max-sm:` / `sm:` Tailwind variants
- All desktop windows have `max-sm:hidden`, all mobile windows have `sm:hidden`

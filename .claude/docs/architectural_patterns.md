# Architectural Patterns

## State Management — Zustand + Immer

**Pattern:** Single store file exports typed slices; Immer `produce` handles all mutations.

`zustand` (v5) is the sole state container — no React Context, no prop-drilling for shared state. `immer` is used via Zustand's `immer` middleware so mutations are written imperatively but remain immutable.

- Store lives in `src/store.ts` (one file per domain slice or a single combined store)
- Components subscribe via selector hooks: `const chores = useStore(s => s.chores)`
- Actions live inside the store definition alongside state, not in separate files
- Side effects (e.g., persisting to localStorage) are handled inside store actions, not in components

## CSS Architecture — CSS Custom Properties + Scoped Files

**Pattern:** Global design tokens in `index.css`; component-level styles in co-located `.css` files.

- `src/index.css:1-10` — CSS custom properties (`--text`, `--bg`, `--accent`, etc.) define the design system
- Dark mode via `@media (prefers-color-scheme: dark)` re-declares the same variables (`src/index.css:33`)
- Component styles import their own `.css` file (`App.css` imported in `App.tsx:5`)
- `clsx` composes conditional class strings; `tailwind-merge` de-duplicates Tailwind utility conflicts when Tailwind is added

## Component Colocation

**Pattern:** Each component owns its styles; logic stays in the component unless shared.

- No shared utility stylesheet beyond `index.css`
- Assets used by a component are imported directly (`src/App.tsx:2-4`)
- No barrel (`index.ts`) exports observed — components are imported by direct path

## TypeScript Configuration

**Pattern:** Strict compile-time checking with bundler-mode resolution.

Key flags in `tsconfig.app.json`:
- `noUnusedLocals` + `noUnusedParameters` — dead code is a compile error
- `erasableSyntaxOnly` — no `const enum` or namespace, keeps TS erasable
- `verbatimModuleSyntax` — import/export types must use `import type`
- `moduleResolution: "bundler"` — Vite handles resolution; `.tsx` extensions allowed in imports

## Linting

**Pattern:** ESLint config in `eslint.config.js` using flat config format (ESLint 9).

Three plugin layers applied to `**/*.{ts,tsx}`:
1. `@eslint/js` recommended
2. `typescript-eslint` recommended
3. `eslint-plugin-react-hooks` (enforces Rules of Hooks)
4. `eslint-plugin-react-refresh` (Vite HMR safety — components must be top-level exports)

`dist/` is globally ignored.

# chore-app

Office chore management app — assign, track, and rotate cleaning/maintenance tasks among employees.

## Tech Stack

| Layer | Choice |
|---|---|
| UI | React 19 + TypeScript |
| Bundler | Vite 5 |
| State | Zustand 5 + Immer 11 |
| Dates | date-fns 4 |
| Classnames | clsx + tailwind-merge |
| Linting | ESLint 9 (typescript-eslint, react-hooks, react-refresh) |

## Key Directories

```
src/               — all application source
src/main.tsx       — entry point, mounts React root
src/App.tsx        — top-level shell, routing/layout
src/index.css      — global CSS variables and base styles
src/App.css        — component styles scoped to App layout
src/assets/        — static images/icons bundled by Vite
.claude/docs/      — supplemental documentation for Claude
```

## Build & Dev Commands

```bash
npm run dev        # start Vite dev server (HMR)
npm run build      # tsc type-check then Vite production build
npm run preview    # serve the production build locally
npm run lint       # ESLint across all .ts/.tsx files
```

TypeScript config: [tsconfig.app.json](tsconfig.app.json) — strict mode, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, target ES2023.

## Entry Points

- HTML shell: [index.html](index.html:11) — single `<div id="root">`, script at `src/main.tsx`
- React root: [src/main.tsx](src/main.tsx:6) — `createRoot` with `StrictMode`
- App component: [src/App.tsx](src/App.tsx)

## Additional Documentation

Check these files when the task touches the relevant area:

| Topic | File |
|---|---|
| State management, component conventions, data flow | [.claude/docs/architectural_patterns.md](.claude/docs/architectural_patterns.md) |

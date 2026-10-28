# Suivi commercial

Internal tool for the school's commercial staff. Same design and motion system as the "Alertes fin de module" tool: read `docs/design-system.md` before building UI.

- Tokens, easing and base rules live in `src/app/globals.css`; do not redefine colors or add a second easing.
- Primitives are in `src/components/ui/` (shadcn, style radix-nova). Add new ones with `pnpm dlx shadcn@latest add <name>`.
- All French copy goes in `src/messages/fr.ts`; DOM ids come from `domId()` (`src/lib/dom-id.ts`).
- This version of Next.js has breaking changes: read `node_modules/next/dist/docs/` before writing framework code.

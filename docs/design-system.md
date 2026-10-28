# Design system: "Alertes fin de module"

Technical reference for building tools that look and behave like this one. Everything below is read from the code (`src/app/globals.css`, `src/components/ui/*`, `src/components/*`); when this file and the code disagree, the code wins.

## 1. Stack

| Concern    | Choice                                                                                                                               |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Framework  | Next.js 16 (App Router), React 19                                                                                                    |
| Styling    | Tailwind CSS v4 (CSS-first, no `tailwind.config`), `tw-animate-css`                                                                  |
| Components | shadcn/ui, style `radix-nova`, base color `neutral`, CSS variables on, icons `lucide` (`components.json`)                            |
| Primitives | `radix-ui` (Checkbox, Dropdown, Popover, Select, Dialog, Tabs, Tooltip, Switch, Separator)                                           |
| Variants   | `class-variance-authority` + `cn()` from `@/lib/utils` (clsx + tailwind-merge)                                                       |
| Icons      | `lucide-react`, 16px by default (`size-4`), 12–14px inside small controls                                                            |
| Toasts     | `sonner`, themed through `src/components/ui/sonner.tsx`                                                                              |
| Font       | Inter (`next/font/google`, variable `--font-sans`), features `"cv11", "ss01"`; mono `ui-monospace, SFMono-Regular, Menlo, monospace` |
| Language   | French UI; all copy lives in `src/messages/fr.ts`                                                                                    |
| Dates      | `Intl.DateTimeFormat("fr-FR")`, formatted at UTC midnight (`src/lib/format.ts`)                                                      |

Bootstrapping another tool: `npx shadcn@latest init` with the same `components.json`, then copy `src/app/globals.css` (tokens, section 2) and `src/components/ui/`.

## 2. Tokens

All colors are `oklch`. Tokens are CSS variables on `:root` (light) and `.dark` (dark), exposed to Tailwind through `@theme inline` (`bg-primary`, `text-muted-foreground`, …). Dark is the **default** theme; light is chosen explicitly and stored in `localStorage["theme"]`. A script in `<head>` (`THEME_INIT_SCRIPT`, `src/lib/theme.ts`) sets the `.dark` class before first paint to avoid a flash. Dark variant: `@custom-variant dark (&:is(.dark *))`.

### 2.1 Core surface and text

| Token                                           | Light                                  | Dark                        |
| ----------------------------------------------- | -------------------------------------- | --------------------------- |
| `--background`                                  | `oklch(1 0 0)`                         | `oklch(0.16 0 0)`           |
| `--foreground`                                  | `oklch(0.145 0 0)`                     | `oklch(0.985 0 0)`          |
| `--card` / `--card-foreground`                  | `oklch(1 0 0)` / `0.145`               | `oklch(0.2 0 0)` / `0.985`  |
| `--popover` / `--popover-foreground`            | `oklch(1 0 0)` / `0.145`               | `oklch(0.22 0 0)` / `0.985` |
| `--primary`                                     | `oklch(0.488 0.217 264)` (blue-violet) | `oklch(0.7 0.15 262)`       |
| `--primary-foreground`                          | `oklch(0.985 0 0)`                     | `oklch(0.16 0.02 262)`      |
| `--secondary`, `--muted`, `--accent`            | `oklch(0.97 0 0)`                      | `oklch(0.269 0 0)`          |
| `--secondary-foreground`, `--accent-foreground` | `oklch(0.205 0 0)`                     | `oklch(0.985 0 0)`          |
| `--muted-foreground`                            | `oklch(0.48 0 0)`                      | `oklch(0.72 0 0)`           |
| `--destructive`                                 | `oklch(0.577 0.245 27.325)`            | `oklch(0.704 0.191 22.216)` |
| `--border`                                      | `oklch(0.922 0 0)`                     | `oklch(1 0 0 / 10%)`        |
| `--input` (control outlines, ~3:1 on white)     | `oklch(0.66 0 0)`                      | `oklch(1 0 0 / 15%)`        |
| `--ring`                                        | `oklch(0.488 0.217 264)`               | `oklch(0.7 0.15 262)`       |

Also defined, from shadcn defaults: `--chart-1…5` (greys) and `--sidebar-*` (unused by the UI today).

### 2.2 Semantic status colors (background / foreground pairs)

| Token pair  | Meaning                                   | Light bg / fg                       | Dark bg / fg                      |
| ----------- | ----------------------------------------- | ----------------------------------- | --------------------------------- |
| `attention` | to do, waiting                            | `0.96 0.05 85` / `0.42 0.09 60`     | `0.3 0.06 75` / `0.88 0.11 85`    |
| `success`   | done                                      | `0.96 0.03 150` / `0.4 0.09 150`    | `0.28 0.05 155` / `0.86 0.1 155`  |
| `warning`   | something to redo (orange, not red)       | `0.95 0.045 50` / `0.47 0.13 45`    | `0.3 0.07 50` / `0.84 0.12 55`    |
| `shared`    | module shared by several classes (violet) | `0.955 0.035 300` / `0.4 0.15 300`  | `0.3 0.07 300` / `0.87 0.1 300`   |
| `linked`    | same survey as other modules (teal)       | `0.955 0.035 195` / `0.4 0.085 195` | `0.28 0.05 195` / `0.86 0.09 195` |
| `team`      | several intervenants on one module (rose) | `0.955 0.035 350` / `0.42 0.14 350` | `0.3 0.07 350` / `0.87 0.1 350`   |

`shared`, `linked` and `team` are reserved for those three buttons and used nowhere else. Info uses `primary/15` over `primary`; late/overdue uses `destructive/15` over `destructive`.

Rule: **shape and label carry the meaning, color only reinforces it** (every status has its own icon and text).

### 2.3 Radius, spacing, motion

- `--radius: 0.625rem`. Scale: `sm` 0.6×, `md` 0.8×, `lg` 1×, `xl` 1.4×, `2xl` 1.8×, `3xl` 2.2×, `4xl` 2.6× (pills).
- Spacing is Tailwind's 4px scale. Controls are `h-8` (32px) by default; page padding `px-4`, `sm:px-6`, `lg:px-10`.
- **One easing everywhere:** `cubic-bezier(0.5, 0, 0, 1)` (`--default-transition-timing-function` and `--tw-ease` set on every element; `EASE` in `src/lib/motion.ts` for JS animations). Spinners stay linear. Dialog/popover enter-exit ≈100ms, bottom sheet 200ms, check confirmation 1400ms.
- While the theme switches, `.theme-switching` disables every transition.

### 2.4 Layout variables (runtime, set by components)

| Variable         | Set by                                                                   | Used for                                                             |
| ---------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `--app-header-h` | `AppHeader` (ResizeObserver)                                             | sticky offsets under the header                                      |
| `--sticky-bar-h` | `StickyBar`                                                              | sticky section titles and table headers under the filter bar         |
| `--app-tabbar-h` | `globals.css`, phones only: `calc(3.5rem + env(safe-area-inset-bottom))` | anything at the bottom of the screen (toasts, back-to-top, page end) |

`page-width` utility: `max-width: calc(50% + 600px)`, centered, aligned across header, banner and content. Phone breakpoint is `< 768px` (`usePhoneScreen`): bottom tab bar, bottom sheets instead of popovers.

### 2.5 Global behavior (`@layer base`)

- Every element: `border-border outline-ring/50`. `:focus-visible`: 2px `outline-ring`, offset 2px.
- Pointer cursor on everything clickable (buttons, links, `role=button|tab|menuitem*|option|switch|checkbox|radio|combobox`, labels of checkboxes), zero specificity via `:where()`; disabled goes back to default cursor.

## 3. Primitives (`src/components/ui/`)

Standard shadcn components, all `data-slot` tagged, with these specifics.

**Button**: variants `default` (primary), `outline`, `secondary`, `ghost`, `destructive` (tinted `destructive/10`, not solid), `link`. Sizes `default` h-8, `xs` h-6, `sm` h-7, `lg` h-9, `icon` 32, `icon-xs` 24, `icon-sm` 28, `icon-lg` 36. Base: `rounded-lg text-sm font-medium`, focus ring `ring-3 ring-ring/50`, press `translate-y-px`, disabled `opacity-50`. Outline in dark: `border-input bg-input/30`.

**Badge**: h-5, `rounded-4xl` pill, `text-xs font-medium`. Variants `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`.

**Card**: `rounded-xl bg-card ring-1 ring-foreground/10`, padding via `--card-spacing` (4, or 3 for `size="sm"`). Title `text-base font-medium`. Footer `bg-muted/50 border-t`.

**Input / Textarea**: h-8, `rounded-lg border-input bg-transparent px-2.5`, focus `border-ring ring-3 ring-ring/50`, invalid `border-destructive ring-destructive/20`.

**Checkbox**: 16px, `rounded-[4px] border-input`, hit area extended with `after:-inset-*`. **Switch**: default and `sm` sizes. **Select / DropdownMenu / Popover**: `rounded-lg bg-popover shadow-md ring-1 ring-foreground/10`, items `rounded-md px-1.5 py-1 text-sm`, focus `bg-accent`. **Dialog / AlertDialog**: `rounded-xl bg-popover ring-1`, overlay `bg-black/10 backdrop-blur-xs`, footer strip `bg-muted/50 border-t`. **BottomSheet** (phones): `rounded-t-2xl`, max-height 85dvh, grab handle `h-1 w-10`, overlay `bg-black/40`. **Tabs**: `default` pill list and `line` variant (underline, 2px `bg-foreground`). **Tooltip**: inverted, `bg-foreground text-background text-xs rounded-md`. **Table**: row hover `bg-muted/50`, header cell h-10 `font-medium`, cell `p-2`, selected row `bg-muted`. **Toasts** (sonner): `--popover` surface, `--border`, radius `--radius`; success icon `text-success-foreground`, error `text-destructive`.

## 4. Product components (`src/components/`)

| Component                                                                                      | Role and rules                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AppHeader`                                                                                    | Top navigation; publishes `--app-header-h`; bottom tab bar (`#app-bottom-nav`) on phones                                                                                                                                                                                                                                                                                                                                                                                         |
| `PageIntro`                                                                                    | One dismissible line under the page title (choice remembered in `localStorage`, shared by all pages)                                                                                                                                                                                                                                                                                                                                                                             |
| `StickyBar`                                                                                    | Filter bar, sticky under the header from 768px, publishes `--sticky-bar-h`; `overlay` slot floats content just below it without affecting layout                                                                                                                                                                                                                                                                                                                                 |
| `FilterBar`, `MultiFilter`, `PeriodFilter`, `FilterSheet`, `ClearFilterButton`, `ModuleSearch` | Filters: outlined controls (`border-input`), multi-select popovers; sheet on phones                                                                                                                                                                                                                                                                                                                                                                                              |
| `StatusChip` + `status-options.ts` + `status-display.ts`                                       | Editable status pill (dropdown on desktop, bottom sheet on phones). Tones: `attention`, `info`, `success`, `muted`, `late`, `warning`, mapped by `TONE_CLASSES`. Meeting statuses: to_schedule (Circle/attention), scheduled (CalendarCheck/info), done (CircleCheck/success), not_needed (CircleMinus/muted); overdue → CalendarX2/late, undated → CalendarClock/attention. Form statuses: pending, open (CircleDot/info), low_response (CircleAlert/warning), done, not_needed |
| `StaffBadge`                                                                                   | `bg-primary/15 text-primary`, h-5 pill, sits right of a staff member's name; never on "En cours de recrutement"                                                                                                                                                                                                                                                                                                                                                                  |
| `SurveyLinkBadge`, `SharedClasses`, `IntervenantCell`                                          | Reserved `linked` / `shared` / `team` color buttons that open a popover list                                                                                                                                                                                                                                                                                                                                                                                                     |
| `ModuleList`, `IntervenantsView`                                                               | Tables (cards on phones); row hover reveals the selection gutter                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `SidePeek`                                                                                     | Right side panel, `lg:w-2/5 lg:min-w-[30rem]`, width `min(100vw, 46rem)` on smaller screens; opened by intercepting routes                                                                                                                                                                                                                                                                                                                                                       |
| `SelectionGutter`                                                                              | Checkbox in a 36px gutter left of the row (`-left-9`), invisible until row hover or while anything is selected (CSS only: `group/row`, `group/list`). Press and drag across boxes selects every row crossed with the first box's resulting state                                                                                                                                                                                                                                 |
| `SelectionBar` / `SelectionButton`                                                             | Floating action bar, `rounded-xl border shadow-md`, fill `color-mix(in oklch, var(--card), var(--foreground) 12%)`, width hugs content, 4px above the table's top border, out of layout flow; count first, vertical `Separator` before every action, clear (X) last; `SelectionButton` is icon-only and shows a `Check` for 1400ms after a successful copy/export                                                                                                                |
| `EmptyState`                                                                                   | Dashed `rounded-xl` card, 24px icon, title `font-semibold`, body `text-muted-foreground text-sm max-w-md`                                                                                                                                                                                                                                                                                                                                                                        |
| `ThemeToggle`, `BackToTop`, `OnboardingTour`, `DetailSection`, `SummaryLine`, `PageTop`        | Supporting pieces                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

## 5. Conventions

- **DOM ids** (`domId()` in `src/lib/dom-id.ts`): kebab-case, outside in, `<component>-<element>`; one record among many: `<component>-<record id>-<element>`. Ids never repeat on a page (a table row and its phone card use different component names).
- **Selection state** lives in an external store (`src/lib/use-selection.ts`, `useSyncExternalStore`) so a click re-renders only the toggled checkbox and the bar. Bulk saves are one DB transaction; every save shows an undo toast (`runWithToast`).
- **Copy**: all strings in `src/messages/fr.ts`; no hard-coded French in components.
- **Dates**: store ISO `YYYY-MM-DD`; display with `formatDateShort` ("lun. 5 mai"), `formatEndDate` ("Mardi 05/05/26"), `formatDateLong`.
- **Accessibility**: visible focus ring everywhere, color never alone, icon-only buttons need an accessible label, hit areas ≥ 32px or extended with pseudo-elements.
- **Responsive**: phone (< 768px) swaps popovers/dropdowns for `BottomSheet`, tables for cards, adds the tab bar; sticky bars start at 768px.
- **Dependencies**: Next 16.3 differs from older Next; read `node_modules/next/dist/docs/` before writing framework code.

## 6. Quick start for a new tool

1. Create a Next.js 16 + Tailwind v4 app; `npx shadcn@latest init` (style `radix-nova`, base `neutral`, lucide).
2. Copy `src/app/globals.css` verbatim (tokens, easing, base rules, cursor rules).
3. Load Inter as `--font-sans`; add `THEME_INIT_SCRIPT` to `<head>`; default to `.dark`.
4. Copy `src/components/ui/`, `src/lib/utils.ts`, `src/lib/motion.ts`, `src/lib/dom-id.ts`.
5. Copy the product components you need (status chips, selection bar, sticky bar) with their message strings.

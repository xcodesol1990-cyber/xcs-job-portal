# UI Design System & Component Tokens

## Overview
WorkNest leverages a unified design language built on **Tailwind CSS v4**, system fonts, semantic color scales, and micro-animations. It merges the modern data density of tools like **Tremor** and **Linear** with the accessible minimalism of **Tailwind UI Catalyst**.

---

## Color Palette & Semantic Tokens

### Primary & Accent Colors
- **Brand Primary**: `purple-600` (`#9333ea`) to `indigo-600` (`#4f46e5`) gradients.
  - Used for primary CTA buttons, active navigation pills, brand badges, and key metrics.
- **Brand Neutral Dark**: `zinc-950` (`#09090b`) to `zinc-900` (`#18181b`).
  - Used for the admin sidebar, dark backgrounds, high-contrast text, and card borders.
- **Brand Neutral Light**: `zinc-50` (`#fafafa`) to `white` (`#ffffff`).
  - Used for background canvas and elevated cards.

### Semantic Status Tokens
- **Success & Financial Inflow**: `emerald-500` / `emerald-600`
  - Badges for `APPROVED`, `FUNDED`, `RELEASED`, `ACTIVE`, and positive financial growth.
- **Warning & Pending Attention**: `amber-500` / `amber-400`
  - Badges for `PENDING`, `UNDER_REVIEW`, `WORK_SUBMITTED`, and pending KYC.
- **Danger & Disputes**: `red-500` / `rose-600`
  - Badges for `DISPUTED`, `SUSPENDED`, `REJECTED`, and urgent moderation alerts.
- **Informational / Discovery**: `sky-500` / `blue-600`
  - Badges for `OPEN` jobs, contract terms, and info tooltips.

---

## Typography & Scale

The system uses Inter / System UI sans-serif fonts optimized for high readability on dense financial tables and dashboards:

| Scale Token | Class | Size / Leading | Target Usage |
| :--- | :--- | :--- | :--- |
| `Heading 1` | `text-2xl sm:text-3xl font-extrabold tracking-tight` | 24px - 30px | Workspace page titles |
| `Heading 2` | `text-lg sm:text-xl font-bold tracking-tight` | 18px - 20px | Section headers, card titles |
| `Heading 3` | `text-sm sm:text-base font-semibold` | 14px - 16px | Subheaders, modal headers |
| `Metric Large` | `text-2xl sm:text-3xl font-extrabold font-mono` | 24px - 30px | KPI financial numbers |
| `Body Standard`| `text-sm text-zinc-600 dark:text-zinc-400` | 14px / 20px | Paragraphs, job descriptions |
| `Caption / Tag`| `text-xs text-zinc-500 font-medium` | 12px / 16px | Meta details, timestamps, tags |
| `Badge Small`  | `text-[10px] sm:text-[11px] font-bold uppercase` | 10px - 11px | Status pills, role tags |

---

## Shimmer Skeleton Animation System

To eliminate jarring blank-page transitions, all route segments include streaming `loading.tsx` wrappers utilizing `@keyframes shimmer`:

```css
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
```

Components available in `src/components/ui/skeleton.tsx`:
- `StatCardSkeleton`: Mimics metric cards with sparkline placeholders.
- `TableRowSkeleton`: Replicates table rows during data streaming.
- `TableSkeleton`: Renders complete data tables with headers.
- `DashboardOverviewSkeleton`: Renders top welcome header, 4 metric cards, liquidity bar, and dual columns.

---

## Toast Notification Standard (Sonner)

All asynchronous CRUD mutations utilize **Sonner** (`<Toaster position="top-right" richColors closeButton />`):
1. **Initiation**: `const toastId = toast.loading("Updating status...")`
2. **Success**: `toast.success("Action completed successfully", { id: toastId })`
3. **Failure**: `toast.error(error.message || "Failed to update", { id: toastId })`

---

## Iconography Standard

Icons are sourced exclusively from **`lucide-react`**:
- `LayoutDashboard`, `Briefcase`, `Users`, `Scale`, `Receipt`, `ShieldCheck` for navigation.
- `Lock`, `CheckCircle2`, `AlertCircle`, `Flag`, `TrendingUp` for financial status and alerts.
- Consistent standard size: `h-4 w-4` for button/nav icons, `h-5 w-5` for cards.

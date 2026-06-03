# Styling rules

## className merging (required)

- `cn()` for all className merging -- no string concatenation, template literals, or `!important` suffix

## Theme colors only (required)

- Tailwind static colors (`text-red-500`, `bg-blue-600`, etc.) **absolutely forbidden**
- Always use shadcn CSS variable tokens:
  - Primary elements: `bg-primary`, `text-primary-foreground`, `ring-primary/30`
  - Secondary/disabled: `text-muted-foreground`, `text-muted-foreground/40`
  - Background/hover: `bg-muted/50`, `hover:bg-muted/50`
  - Destructive: `text-destructive`, `bg-destructive`
  - Warning: `text-warning`, `bg-warning/20`
  - Success: `text-success`, `bg-success`
  - Info: `text-info`, `bg-info`
  - Card/popover: `bg-card`, `bg-popover`
  - Chart: `text-[--chart-1]` through `text-[--chart-5]`
  - Static-to-token mapping: green -> success, red -> destructive, blue -> primary, gray/zinc -> muted / muted-foreground, amber -> warning

## shadcn/ui (required)

- Never modify `src/components/ui/` directly -- extend only

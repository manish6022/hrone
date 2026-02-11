# HROne Theme System Guide

## Overview

The HROne application uses a centralized theme system where all colors, spacing, typography, and design tokens are defined in a single file: `src/styles/theme.css`

## How to Change Colors

### Single Source of Truth

All theme colors are defined in `src/styles/theme.css`. When you change a color there, it automatically updates throughout the entire application.

### Primary Brand Colors

```css
--brand-primary: #1a1a1a; /* Main brand color (dark) */
--brand-secondary: #f8f9fa; /* Secondary brand color (light) */
--brand-accent: #3b82f6; /* Accent color (blue) */
```

**Example:** To change the accent color from blue to purple:

```css
--brand-accent: #8b5cf6; /* Purple */
--brand-accent-light: #a78bfa;
--brand-accent-dark: #7c3aed;
```

### Background Colors

```css
--bg-primary: #ffffff; /* Main background */
--bg-secondary: #f8f9fa; /* Secondary background */
--bg-tertiary: #f1f3f5; /* Tertiary background */
```

### Text Colors

```css
--text-primary: #1a1a1a; /* Main text */
--text-secondary: #6b7280; /* Secondary text */
--text-tertiary: #9ca3af; /* Tertiary text */
```

### Status Colors

```css
--status-success: #10b981; /* Success state */
--status-warning: #f59e0b; /* Warning state */
--status-error: #ef4444; /* Error state */
--status-info: #3b82f6; /* Info state */
```

## Common Theme Customizations

### 1. Change to Warm Theme

```css
:root {
  --brand-primary: #8b4513;
  --brand-accent: #d2691e;
  --bg-primary: #faf8f3;
  --bg-secondary: #f5f1e8;
}
```

### 2. Change to Cool Theme

```css
:root {
  --brand-primary: #1e3a8a;
  --brand-accent: #3b82f6;
  --bg-primary: #f0f9ff;
  --bg-secondary: #e0f2fe;
}
```

### 3. Change to Dark Professional Theme

```css
:root {
  --brand-primary: #0a0a0a;
  --brand-accent: #6366f1;
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
}
```

### 4. Change to Vibrant Theme

```css
:root {
  --brand-primary: #ec4899;
  --brand-accent: #f59e0b;
  --bg-primary: #ffffff;
  --bg-secondary: #fef3c7;
}
```

## Using Theme Variables in Components

### In CSS/Tailwind

```css
/* Use theme variables directly */
.my-component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}
```

### In Inline Styles (React)

```jsx
<div
  style={{
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    borderRadius: "var(--radius-lg)",
  }}
>
  Content
</div>
```

### Using Utility Classes

The theme automatically works with Tailwind utility classes:

```jsx
<div className="bg-background text-foreground border-border rounded-lg p-4">
  Content
</div>
```

## Spacing System

```css
--spacing-xs: 0.25rem; /* 4px */
--spacing-sm: 0.5rem; /* 8px */
--spacing-md: 1rem; /* 16px */
--spacing-lg: 1.5rem; /* 24px */
--spacing-xl: 2rem; /* 32px */
--spacing-2xl: 3rem; /* 48px */
```

## Border Radius System

```css
--radius-sm: 0.5rem; /* 8px */
--radius-md: 0.75rem; /* 12px */
--radius-lg: 1rem; /* 16px */
--radius-xl: 1.25rem; /* 20px */
--radius-2xl: 1.5rem; /* 24px */
--radius-full: 9999px; /* Fully rounded */
```

## Typography System

```css
--font-size-xs: 0.75rem; /* 12px */
--font-size-sm: 0.875rem; /* 14px */
--font-size-base: 1rem; /* 16px */
--font-size-lg: 1.125rem; /* 18px */
--font-size-xl: 1.25rem; /* 20px */
--font-size-2xl: 1.5rem; /* 24px */
--font-size-3xl: 1.875rem; /* 30px */
--font-size-4xl: 2.25rem; /* 36px */
```

## Shadow System

```css
--shadow-sm: ...    /* Small shadow */
--shadow-md: ...    /* Medium shadow */
--shadow-lg: ...    /* Large shadow */
--shadow-xl: ...    /* Extra large shadow */
```

## Dark Mode

Dark mode colors are automatically defined in the `.dark` class in `theme.css`. The theme system handles the switch automatically.

## Best Practices

1. **Always use theme variables** instead of hardcoded colors
2. **Use semantic names** (e.g., `--text-primary` instead of `--color-black`)
3. **Test in both light and dark modes** after making changes
4. **Keep consistency** - use the same spacing/radius values throughout
5. **Document custom changes** if you add new variables

## Quick Reference

| Component          | Variable              |
| ------------------ | --------------------- |
| Sidebar background | `--sidebar-bg`        |
| Card background    | `--card-bg`           |
| Button primary     | `--button-primary-bg` |
| Input border       | `--input-border`      |
| Text color         | `--text-primary`      |
| Border color       | `--border-primary`    |
| Accent color       | `--brand-accent`      |

## Need Help?

If you need to change the theme:

1. Open `src/styles/theme.css`
2. Find the variable you want to change
3. Update the value
4. Save the file
5. The changes will reflect across the entire application automatically!

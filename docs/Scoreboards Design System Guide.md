# Scoreboards Design System Guide

**Product:** Scoreboards  
**Tagline:** "Understand your business at a glance."  
**Version:** 1.0  
**Author:** Manus AI

---

## Overview

Scoreboards is a multi-tenant SaaS application designed to help small and medium businesses understand their key metrics through a clean, visual interface. The design philosophy draws inspiration from Notion, ClickUp, Linear, and Height—emphasizing clarity, readability, and minimal visual noise.

**Core Principle:** Metrics made human—simple, structured, and insightful.

**Target Audience:** Business owners and marketing managers who want data clarity without complexity.

---

## Design Philosophy

The Scoreboards interface prioritizes **readability and hierarchy** above all else. Numbers and charts should feel effortless to scan. The aesthetic is modern, calm, and professional—business dashboards that feel light and human, not corporate or sterile.

**Key Characteristics:**
- White or near-white backgrounds with generous whitespace
- Soft grey grid lines for structure without distraction
- Rounded corners (12–16px) for a friendly, modern feel
- Subtle shadows for depth and layering
- Indigo/violet gradient accents for highlights and interactive elements
- Geometric, neutral typography for clarity

---

## Color System

### Primary Colors

The primary color palette uses an indigo-to-violet gradient for interactive elements, active states, and visual emphasis.

```css
--color-primary-600: #6366F1;  /* Primary indigo */
--color-primary-700: #4F46E5;  /* Deeper violet */
--color-primary-gradient: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
```

### Neutral Colors

Neutrals provide the foundation for backgrounds, text, and borders.

```css
--color-neutral-50: #FAFAFA;   /* Lightest background */
--color-neutral-100: #F5F5F5;  /* Surface background */
--color-neutral-200: #E5E5E5;  /* Subtle borders */
--color-neutral-300: #D4D4D4;  /* Grid lines */
--color-neutral-400: #A3A3A3;  /* Disabled text */
--color-neutral-500: #737373;  /* Secondary text */
--color-neutral-600: #525252;  /* Body text */
--color-neutral-700: #404040;  /* Headings */
--color-neutral-900: #171717;  /* Darkest text */
```

### Semantic Colors

Semantic colors communicate status and feedback.

```css
/* Success */
--color-success-50: #F0FDF4;
--color-success-500: #10B981;
--color-success-600: #059669;

/* Error */
--color-error-50: #FEF2F2;
--color-error-500: #EF4444;
--color-error-600: #DC2626;

/* Warning */
--color-warning-50: #FFFBEB;
--color-warning-500: #F59E0B;
--color-warning-600: #D97706;

/* Info */
--color-info-50: #EFF6FF;
--color-info-500: #3B82F6;
--color-info-600: #2563EB;
```

### Surface Colors

Surface colors define layered backgrounds and containers.

```css
--color-bg-base: #FFFFFF;        /* Page background */
--color-bg-surface: #FAFAFA;     /* Card/panel background */
--color-bg-elevated: #FFFFFF;    /* Elevated cards */
--color-bg-overlay: rgba(0, 0, 0, 0.5);  /* Modal overlay */
```

### Border Colors

```css
--color-border-light: #F5F5F5;   /* Subtle dividers */
--color-border-default: #E5E5E5; /* Standard borders */
--color-border-strong: #D4D4D4;  /* Emphasized borders */
--color-border-grid: #F0F0F0;    /* Table grid lines */
```

---

## Typography

### Font Family

**Primary Font:** Inter (or Satoshi as alternative)

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace; /* For numeric data */
```

### Type Scale

The type scale follows a consistent hierarchy optimized for dashboard readability.

```css
/* Display */
--text-display-size: 48px;
--text-display-weight: 700;
--text-display-line-height: 1.1;

/* Heading 1 */
--text-h1-size: 36px;
--text-h1-weight: 700;
--text-h1-line-height: 1.2;

/* Heading 2 */
--text-h2-size: 30px;
--text-h2-weight: 600;
--text-h2-line-height: 1.3;

/* Heading 3 */
--text-h3-size: 24px;
--text-h3-weight: 600;
--text-h3-line-height: 1.4;

/* Heading 4 */
--text-h4-size: 20px;
--text-h4-weight: 600;
--text-h4-line-height: 1.4;

/* Body Large */
--text-body-lg-size: 16px;
--text-body-lg-weight: 400;
--text-body-lg-line-height: 1.6;

/* Body */
--text-body-size: 14px;
--text-body-weight: 400;
--text-body-line-height: 1.6;

/* Body Small */
--text-body-sm-size: 13px;
--text-body-sm-weight: 400;
--text-body-sm-line-height: 1.5;

/* Caption */
--text-caption-size: 12px;
--text-caption-weight: 500;
--text-caption-line-height: 1.4;

/* Label */
--text-label-size: 11px;
--text-label-weight: 600;
--text-label-line-height: 1.4;
--text-label-transform: uppercase;
--text-label-spacing: 0.05em;
```

### Numeric Display

For metric values and data tables, use tabular numbers for alignment.

```css
--font-feature-numeric: tabular-nums;
```

---

## Spacing System

Spacing follows a 4px base unit with a consistent scale.

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
```

### Layout Spacing

```css
--layout-padding-sm: var(--space-4);   /* 16px */
--layout-padding-md: var(--space-6);   /* 24px */
--layout-padding-lg: var(--space-8);   /* 32px */
--layout-gap-sm: var(--space-3);       /* 12px */
--layout-gap-md: var(--space-4);       /* 16px */
--layout-gap-lg: var(--space-6);       /* 24px */
```

---

## Border Radius

Rounded corners create a friendly, modern aesthetic.

```css
--radius-sm: 6px;    /* Small elements (badges, tags) */
--radius-md: 8px;    /* Buttons, inputs */
--radius-lg: 12px;   /* Cards, panels */
--radius-xl: 16px;   /* Large containers */
--radius-2xl: 20px;  /* Modal dialogs */
--radius-full: 9999px; /* Pills, avatars */
```

---

## Shadows & Elevation

Shadows provide depth and layering without heaviness.

```css
/* Subtle shadow for cards */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

/* Default card shadow */
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06);

/* Elevated elements */
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05);

/* Modals and popovers */
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04);

/* Dropdowns */
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

---

## Transitions

Smooth, consistent animations enhance the user experience.

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Component Specifications

### Button

Buttons are the primary interactive element. They use the indigo gradient for primary actions and neutral tones for secondary actions.

**Variants:**
- **Primary:** Gradient background, white text
- **Secondary:** White background, border, neutral text
- **Text:** No background, primary color text

**States:** Default, Hover, Active, Disabled

```css
/* Primary Button */
.button-primary {
  background: var(--color-primary-gradient);
  color: white;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-body-size);
  font-weight: 600;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

.button-primary:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

/* Secondary Button */
.button-secondary {
  background: white;
  color: var(--color-neutral-700);
  border: 1px solid var(--color-border-default);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-body-size);
  font-weight: 600;
  transition: all var(--transition-base);
}

.button-secondary:hover {
  border-color: var(--color-primary-600);
  color: var(--color-primary-600);
}

/* Text Button */
.button-text {
  background: transparent;
  color: var(--color-primary-600);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-body-size);
  font-weight: 600;
  transition: color var(--transition-base);
}

.button-text:hover {
  color: var(--color-primary-700);
}
```

### Card / Panel

Cards contain related content and provide visual grouping.

```css
.card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  transition: box-shadow var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card-elevated {
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-md);
}
```

### Input Fields

Input fields are clean and minimal, with clear focus states.

```css
.input {
  background: white;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-body-size);
  color: var(--color-neutral-700);
  transition: all var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-600);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-number {
  font-variant-numeric: tabular-nums;
  text-align: right;
}
```

### Data Table / Grid

The data table is the core component for the Scoreboard page.

```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-header {
  background: var(--color-neutral-50);
  border-bottom: 1px solid var(--color-border-default);
}

.table-cell {
  padding: var(--space-3) var(--space-4);
  border-right: 1px solid var(--color-border-grid);
  border-bottom: 1px solid var(--color-border-grid);
  font-size: var(--text-body-sm-size);
  color: var(--color-neutral-600);
}

.table-cell-header {
  font-weight: 600;
  color: var(--color-neutral-700);
  text-transform: uppercase;
  font-size: var(--text-label-size);
  letter-spacing: var(--text-label-spacing);
}

.table-cell-numeric {
  font-variant-numeric: tabular-nums;
  text-align: right;
  font-family: var(--font-mono);
}

.table-cell:hover {
  background: var(--color-neutral-50);
  cursor: pointer;
}
```

### Dropdown / Select

Dropdowns for brand and year selection.

```css
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  background: white;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-body-size);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--space-1));
  left: 0;
  background: white;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);
  min-width: 200px;
  z-index: 100;
}

.dropdown-item {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-body-size);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--color-neutral-50);
}

.dropdown-item-active {
  background: var(--color-primary-gradient);
  color: white;
}
```

### Toggle Switch

For Year-to-Date and other binary options.

```css
.toggle {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-neutral-300);
  border-radius: var(--radius-full);
  transition: background var(--transition-base);
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: transform var(--transition-base);
}

.toggle-input:checked + .toggle-slider {
  background: var(--color-primary-gradient);
}

.toggle-input:checked + .toggle-slider:before {
  transform: translateX(20px);
}
```

### Chart Container

Charts should match the clean, minimal aesthetic.

```css
.chart-container {
  background: white;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
}

.chart-title {
  font-size: var(--text-h4-size);
  font-weight: var(--text-h4-weight);
  color: var(--color-neutral-700);
  margin-bottom: var(--space-4);
}

.chart-legend {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.chart-legend-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-body-sm-size);
  color: var(--color-neutral-600);
}

.chart-legend-color {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-sm);
}
```

---

## Page Layouts

### Scoreboard Page

The Scoreboard page displays a grid of metrics (rows) vs. months (columns).

**Layout Structure:**
- Header with brand selector, year selector, and "Add Metric" button
- Data grid with metric names in first column, months across top
- Each cell is editable and displays numeric values
- Hover states highlight rows and cells

**Key Elements:**
- Page title: "Scoreboard"
- Brand dropdown (top-left)
- Year selector (top-right)
- "Add Metric" button (primary, top-right)
- Table with sticky header row and first column

### Metric Detail Page

When a metric is clicked, users see detailed analysis.

**Layout Structure:**
- Header with metric name and back button
- Year comparison table (stacked by year)
- Trendline chart comparing years
- AI Insight panel (right sidebar)

**Key Elements:**
- Back button (top-left)
- Metric title (H1)
- Year tabs or selector
- Comparison table with year-over-year data
- Line chart with multiple year lines
- AI Insight panel with summary text and highlights

---

## Interaction Patterns

### Editable Table Cells

Cells in the Scoreboard grid are editable on click.

**Behavior:**
1. Default state: Display value with subtle hover
2. Click: Cell becomes input field with focus
3. Type: Update value in real-time
4. Enter or blur: Save and return to display state
5. Escape: Cancel and revert

### Modal Dialogs

Modals for adding metrics or confirming actions.

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-bg-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-2xl);
}

.modal-header {
  font-size: var(--text-h3-size);
  font-weight: var(--text-h3-weight);
  margin-bottom: var(--space-4);
}

.modal-footer {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-6);
}
```

### Loading States

Skeleton screens for data loading.

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-neutral-100) 25%,
    var(--color-neutral-200) 50%,
    var(--color-neutral-100) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Implementation Notes for Cursor

### CSS Variables Setup

All design tokens should be defined as CSS custom properties in the root:

```css
:root {
  /* Colors */
  --color-primary-600: #6366F1;
  --color-primary-700: #4F46E5;
  /* ... all other tokens ... */
}
```

### Component Architecture

- Use React components with TypeScript
- Implement shadcn/ui or Radix UI for accessible primitives
- Use Tailwind CSS with custom theme extending the design tokens
- Chart library: Recharts or Chart.js with custom styling

### Data Structure

```typescript
interface Metric {
  id: string;
  name: string;
  dataSource: string;
  values: Record<string, number>; // { "2024-01": 1234, ... }
}

interface Brand {
  id: string;
  name: string;
  metrics: Metric[];
}
```

### Responsive Behavior

- Desktop-first design (1440px optimal)
- Tablet: Stack AI panel below chart
- Mobile: Horizontal scroll for table, vertical stack for detail page

---

## Summary

The Scoreboards design system prioritizes clarity, simplicity, and readability. Every element is designed to help users understand their business metrics at a glance, without visual clutter or complexity. The Notion/ClickUp-inspired aesthetic creates a calm, professional environment where data feels accessible and human.

**Key Takeaways:**
- Clean, minimal interface with generous whitespace
- Indigo gradient for interactive elements and emphasis
- Tabular numbers and monospace fonts for data clarity
- Subtle shadows and rounded corners for depth
- Consistent spacing and typography hierarchy
- Editable table cells for quick data entry
- AI insights for actionable intelligence

This guide provides everything needed to implement Scoreboards with pixel-perfect precision and interaction fidelity.


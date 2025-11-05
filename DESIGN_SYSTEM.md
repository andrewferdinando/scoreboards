# Design System

A clean, elegant design system built with Tailwind CSS.

## Color Palette

### Primary (Sky Blue)
- Used for primary actions, links, and accents
- Scale: `primary-50` through `primary-950`
- Default: `primary-600` for buttons and links

### Gray (Neutral)
- Used for text, borders, backgrounds
- Scale: `gray-50` through `gray-950`
- Background: `gray-50`
- Text: `gray-900`

### Accent (Teal)
- Used for secondary highlights and accents
- Scale: `accent-50` through `accent-900`

### Success (Green)
- Used for success states and positive actions
- Scale: `success-50` through `success-900`

### Error (Red)
- Used for errors, warnings, and destructive actions
- Scale: `error-50` through `error-900`

## Typography

### Headings
- **H1**: `text-4xl lg:text-5xl` - Main page titles
- **H2**: `text-3xl lg:text-4xl` - Section titles
- **H3**: `text-2xl lg:text-3xl` - Subsection titles
- **H4**: `text-xl lg:text-2xl` - Card titles

### Body Text
- **Base**: `text-base` - Default body text
- **Small**: `text-sm` - Secondary text, captions
- **Large**: `text-lg` - Emphasis text

### Font Family
- **Sans**: Geist Sans (system fallback)
- **Mono**: Geist Mono (for code/data)

## Spacing

### Scale
- Generous spacing throughout
- Standard Tailwind scale (4px base unit)
- Extended: `18` (4.5rem), `88` (22rem), `128` (32rem)

### Section Spacing
- `.section`: `py-12 lg:py-16` - Main section padding
- `.space-section`: `space-y-8 lg:space-y-12` - Vertical spacing between sections

## Components

### Cards
- `.card`: Base card with soft shadow
- `.card-hover`: Card with hover elevation effect

### Buttons
- `.btn-primary`: Primary action (blue)
- `.btn-secondary`: Secondary action (gray)
- `.btn-ghost`: Subtle action (transparent)
- `.btn-danger`: Destructive action (red)

All buttons include:
- Smooth transitions
- Active scale effect
- Focus ring for accessibility

### Inputs
- `.input`: Standard input field
- `.input-error`: Error state input

Features:
- Rounded corners (xl)
- Soft focus ring
- Smooth transitions

### Badges
- `.badge-primary`: Primary badge
- `.badge-success`: Success badge
- `.badge-error`: Error badge
- `.badge-gray`: Neutral badge

### Labels
- `.label`: Standard form label
- `.label-required`: Label with required asterisk

## Shadows

- **Soft**: `shadow-soft` - Subtle elevation (cards, buttons)
- **Medium**: `shadow-medium` - Medium elevation (hover states)
- **Large**: `shadow-large` - Strong elevation (modals, dropdowns)
- **Inner Soft**: `inner-soft` - Inset shadow (inputs)

## Border Radius

- **xl**: `0.75rem` - Default (buttons, inputs)
- **2xl**: `1rem` - Cards
- **3xl**: `1.5rem` - Large elements

## Transitions

- All interactive elements have smooth `200ms` transitions
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Active states: `scale-[0.98]` for tactile feedback

## Layout

### Container
- `.container-custom`: Max-width container with responsive padding
- Max width: `7xl` (80rem)
- Padding: `px-4 sm:px-6 lg:px-8`

## Utilities

### Animations
- `.animate-fade-in`: Fade in with subtle slide up

### Scrollbar
- `.scrollbar-thin`: Custom thin scrollbar styling

## Usage Examples

```tsx
// Card
<div className="card p-6">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

// Button
<button className="btn-primary">Primary Action</button>

// Input
<label className="label">Email</label>
<input type="email" className="input" placeholder="Enter email" />

// Badge
<span className="badge-primary">New</span>
```

## Design Principles

1. **Generous Spacing**: Breathing room between elements
2. **Subtle Shadows**: Soft elevation for depth
3. **Smooth Transitions**: All interactions are animated
4. **Accessibility**: Focus states, proper contrast
5. **Consistency**: Reusable components and patterns




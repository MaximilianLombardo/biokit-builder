# Design System Documentation
## biokit-builder

Version: 1.0.0  
Date: August 2024

---

## Overview

The biokit-builder Design System ensures visual and functional consistency across all generated applications. It provides a comprehensive set of design tokens, components, and patterns that automatically enforce best practices and accessibility standards.

## Design Principles

1. **Consistency First**: Every generated app follows the same design language
2. **Accessibility Built-in**: WCAG 2.1 AA compliance by default
3. **Performance Optimized**: Minimal CSS, efficient components
4. **Customizable**: Easy theming while maintaining consistency
5. **Responsive**: Mobile-first approach
6. **Modern**: Following current design trends

## Design Tokens

### Color System

```typescript
// Base Colors
const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },
  
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },
  
  semantic: {
    success: {
      light: '#10b981',
      DEFAULT: '#059669',
      dark: '#047857',
    },
    warning: {
      light: '#fbbf24',
      DEFAULT: '#f59e0b',
      dark: '#d97706',
    },
    error: {
      light: '#f87171',
      DEFAULT: '#ef4444',
      dark: '#dc2626',
    },
    info: {
      light: '#60a5fa',
      DEFAULT: '#3b82f6',
      dark: '#2563eb',
    },
  },
}
```

### Typography

```typescript
const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    serif: ['Merriweather', 'Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },
  
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
}
```

### Spacing

```typescript
const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
}
```

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large desktop
}
```

### Shadows

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
}
```

### Border Radius

```typescript
const borderRadius = {
  none: '0px',
  sm: '0.125rem',   // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
}
```

## Component Library

### Base Components

#### Button

```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

// Usage
<Button variant="primary" size="md">
  Click me
</Button>
```

#### Input

```tsx
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  size?: 'sm' | 'md' | 'lg'
  error?: string
  label?: string
  hint?: string
  icon?: React.ReactNode
  required?: boolean
}

// Usage
<Input
  label="Email"
  type="email"
  error={errors.email}
  required
/>
```

#### Card

```tsx
interface CardProps {
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  interactive?: boolean
  children: React.ReactNode
}

// Usage
<Card variant="elevated" padding="lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Composite Components

#### DataTable

```tsx
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  pagination?: boolean
  sorting?: boolean
  filtering?: boolean
  selection?: boolean
}
```

#### Form

```tsx
interface FormProps {
  schema: ZodSchema
  onSubmit: (data: any) => void
  defaultValues?: any
  children: React.ReactNode
}
```

#### Modal

```tsx
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
}
```

## Layout Patterns

### Container

```css
.container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: 1rem;
  padding-left: 1rem;
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

@media (min-width: 1536px) {
  .container { max-width: 1536px; }
}
```

### Grid System

```tsx
// 12-column grid
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-12 md:col-span-6 lg:col-span-4">
    {/* Content */}
  </div>
</div>

// Auto-fit grid
<div className="grid grid-cols-auto-fit-[minmax(250px,1fr)] gap-4">
  {/* Items */}
</div>
```

### Flex Utilities

```tsx
// Common flex patterns
<div className="flex items-center justify-between">
  <div>Left</div>
  <div>Right</div>
</div>

<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Animation System

### Transitions

```typescript
const transitions = {
  all: 'all 150ms ease',
  colors: 'colors 150ms ease',
  opacity: 'opacity 150ms ease',
  shadow: 'box-shadow 150ms ease',
  transform: 'transform 150ms ease',
}
```

### Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

## Theme Configuration

### Light Theme

```typescript
const lightTheme = {
  background: colors.white,
  foreground: colors.gray[900],
  card: colors.white,
  cardForeground: colors.gray[900],
  primary: colors.primary[600],
  primaryForeground: colors.white,
  secondary: colors.gray[100],
  secondaryForeground: colors.gray[900],
  muted: colors.gray[100],
  mutedForeground: colors.gray[500],
  border: colors.gray[200],
  input: colors.gray[200],
  ring: colors.primary[500],
}
```

### Dark Theme

```typescript
const darkTheme = {
  background: colors.gray[950],
  foreground: colors.gray[50],
  card: colors.gray[900],
  cardForeground: colors.gray[50],
  primary: colors.primary[500],
  primaryForeground: colors.gray[50],
  secondary: colors.gray[800],
  secondaryForeground: colors.gray[50],
  muted: colors.gray[800],
  mutedForeground: colors.gray[400],
  border: colors.gray[800],
  input: colors.gray[800],
  ring: colors.primary[400],
}
```

## Accessibility

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- UI components: 3:1 contrast ratio

### Focus States

```css
.focus-visible {
  outline: 2px solid transparent;
  outline-offset: 2px;
  ring: 2px;
  ring-color: var(--ring);
  ring-offset: 2px;
}
```

### ARIA Patterns

```tsx
// Accessible button
<button
  role="button"
  aria-label="Save document"
  aria-pressed={isPressed}
  aria-disabled={disabled}
>
  Save
</button>

// Accessible form
<form aria-label="User registration">
  <label htmlFor="email">
    Email
    <span aria-label="required">*</span>
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby="email-error"
  />
  {errors.email && (
    <span id="email-error" role="alert">
      {errors.email}
    </span>
  )}
</form>
```

## Usage Guidelines

### Component Selection

1. **Buttons**: Use for actions (submit, cancel, delete)
2. **Links**: Use for navigation
3. **Cards**: Use for grouped content
4. **Modals**: Use sparingly for critical actions
5. **Toast**: Use for non-blocking notifications

### Color Usage

1. **Primary**: Main CTAs, important actions
2. **Secondary**: Supporting actions
3. **Success**: Positive feedback, confirmations
4. **Warning**: Caution states, warnings
5. **Error**: Error states, destructive actions
6. **Info**: Informational messages

### Spacing Guidelines

1. Use consistent spacing from the scale
2. Maintain visual hierarchy with spacing
3. Group related elements with less space
4. Separate sections with more space

### Typography Guidelines

1. **Headings**: Use semantic HTML (h1-h6)
2. **Body text**: 16px base size minimum
3. **Line height**: 1.5 for body text
4. **Font weight**: Use sparingly for emphasis

## Customization

### Creating Custom Themes

```typescript
import { createTheme } from '@biokit/design-system';

const customTheme = createTheme({
  colors: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
  },
  fonts: {
    sans: 'Poppins, sans-serif',
  },
  borderRadius: {
    DEFAULT: '8px',
  },
});

export default customTheme;
```

### Extending Components

```tsx
import { Button } from '@biokit/design-system';
import { styled } from '@biokit/styled';

const GradientButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  &:hover {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  }
`;
```

### Overriding Tokens

```css
:root {
  --primary-500: #FF6B6B;
  --primary-600: #FF5252;
  --primary-700: #FF3838;
  
  --font-sans: 'Poppins', sans-serif;
  
  --radius-md: 8px;
  --radius-lg: 12px;
}
```

## Integration

### With Tailwind CSS

```javascript
// tailwind.config.js
import { designTokens } from '@biokit/design-system';

export default {
  theme: {
    extend: {
      colors: designTokens.colors,
      fontFamily: designTokens.typography.fontFamily,
      fontSize: designTokens.typography.fontSize,
      spacing: designTokens.spacing,
    },
  },
};
```

### With CSS-in-JS

```typescript
import { tokens } from '@biokit/design-system';
import { css } from '@emotion/react';

const styles = css`
  color: ${tokens.colors.primary[600]};
  font-family: ${tokens.typography.fontFamily.sans};
  padding: ${tokens.spacing[4]};
`;
```

## Best Practices

1. **Consistency**: Always use design tokens
2. **Accessibility**: Test with screen readers
3. **Performance**: Minimize custom CSS
4. **Responsiveness**: Design mobile-first
5. **Documentation**: Document custom components
6. **Testing**: Include visual regression tests

## Resources

- [Component Storybook](https://storybook.biokit-builder.dev)
- [Figma Design Files](https://figma.com/biokit-design-system)
- [Token Reference](https://biokit-builder.dev/tokens)
- [Accessibility Guide](https://biokit-builder.dev/a11y)
# 🎨 Animated Elements - Usage Guide

## Components Overview

Two reusable animated components with sophisticated geometric animations:

### 1. `SpinningGeometric` 
- **Animation**: Slow 8-second rotation with accent dot ping
- **Shape**: Rounded square with floating accent
- **Best for**: Elegant continuous motion

### 2. `WobblingGeometric`
- **Animation**: Organic wobble with scale variations
- **Shape**: Rounded rectangle with accent dot
- **Best for**: Playful, attention-grabbing effects

## Usage Examples

### Basic Usage
```tsx
import { SpinningGeometric, WobblingGeometric } from '@/components/animated-elements'

// Simple spinning element
<SpinningGeometric className="absolute top-10 left-10" />

// Simple wobbling element  
<WobblingGeometric className="absolute bottom-10 right-10" />
```

### Advanced Configuration
```tsx
// Large spinning element with custom colors
<SpinningGeometric 
  className="absolute top-16 left-8" 
  size="lg"
  opacity={0.4}
  colors={{
    primary: 'from-purple-400 to-pink-500',
    secondary: 'from-pink-400 to-red-400'
  }}
/>

// Small wobbling element with custom accent
<WobblingGeometric 
  className="absolute bottom-20 right-12" 
  size="sm"
  opacity={0.2}
  colors={{
    primary: 'from-green-400 to-emerald-500',
    accent: 'bg-yellow-300'
  }}
/>
```

## Props Reference

### SpinningGeometric Props
- `className?`: Positioning and layout classes
- `size?`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `opacity?`: 0-1 opacity value (default: 0.3)
- `colors?`: Object with `primary` and `secondary` gradient classes

### WobblingGeometric Props  
- `className?`: Positioning and layout classes
- `size?`: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
- `opacity?`: 0-1 opacity value (default: 0.3)
- `colors?`: Object with `primary` gradient and optional `accent` classes

## Size Reference
- **sm**: 12x12 main element
- **md**: 16x16 / 20x20 main element (default)
- **lg**: 20x20 / 24x24 main element
- **xl**: 24x24 / 28x28 main element

## Color Examples
```tsx
// Blue theme
colors={{
  primary: 'from-blue-400 to-indigo-500',
  secondary: 'from-indigo-400 to-blue-400'
}}

// Warm theme
colors={{
  primary: 'from-orange-400 to-red-500', 
  secondary: 'from-red-400 to-pink-400'
}}

// Nature theme  
colors={{
  primary: 'from-green-400 to-emerald-500',
  accent: 'bg-yellow-300'
}}
```

## Performance Notes
- Animations use GPU acceleration (transform properties)
- Lightweight CSS animations, no JavaScript required
- Safe to use multiple instances simultaneously
- Consider opacity 0.1-0.4 for subtle background effects

## Design Guidelines
- Use for **subtle background decoration**
- Position with **absolute positioning**  
- Keep **opacity low** (0.1-0.4) for non-distracting effects
- **Vary sizes** for visual interest
- **Different colors** per section for thematic consistency
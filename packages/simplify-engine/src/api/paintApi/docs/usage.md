# paintApi — Introduction

paintApi provides declarative utilities for marking ModeColor tokens as paintable values within the SimplifyUI theming and rendering pipeline.
A PaintValue is a structural wrapper that tells downstream systems:

- this value is a color, and

- this color must be resolved according to the active theme mode.

Paint values do not resolve colors themselves.
They simply tag a ModeColor token so the paint engine, sheet compiler, or CSS variable resolver can resolve the correct channel (light, dark, highContrast) at render time.

The API is intentionally minimal and follows the core Simplify design principles:

- Deterministic — no mutation, no inference, no hidden behavior.

- Rectangular — every paint value is fully shaped and tagged.

- Composable — **`paint.with()`** enables ergonomic partial application.

- Runtime‑safe — **`isPaint()`** provides a strict, type‑safe guard.

- Structural — paint values are not resolved here; they are passed downstream.

PaintApi is the structural layer of the color system.
It wraps color tokens, carries optional mode overrides, and integrates seamlessly with suiColor, suiSheet, and the theme resolution pipeline.

## Basic Usage

**`paint()`** wraps a ModeColor token into a PaintValue.
This marks the color as paintable, meaning downstream systems (sheets, the paint engine, CSS variable resolvers) will resolve the correct channel (light, dark, highContrast) based on the active theme mode.

In real usage, you will rarely call **`mc()`** directly.
Instead, you will use suiColor, which provides fully‑formed ModeColor tokens.

```ts
import { paint, suiColor } from "@simplify/engine";

// Grab a ModeColor token from the palette
const accentBg = suiColor.layers.accent.background.default;

// Wrap it as a PaintValue
const background = paint(accentBg);
```

This produces a structural PaintValue:

```ts
{
  __paint: true,
  token: {
    light: "#0078d4",
    dark: "#2899f5",
    highContrast: "#0000ff"
  },
  options: undefined
}
```

Paint values are not resolved here.
They are passed downstream to the sheet compiler or paint engine, which chooses the correct color channel based on the current theme mode.

## Forcing a Theme Mode
**`paint()`** can optionally force a specific theme mode.
This overrides the global theme and locks the paint value to a single color channel.

You can pass either:

- a ThemeMode string ("light" | "dark" | "highContrast"), or

- a PaintOptions object ({ mode: ThemeMode })

```ts
import { paint, suiColor } from "@simplify/engine";

const forcedDark = paint(
  suiColor.layers.accent.background.default,
  "dark"
);
```

This produces a PaintValue that will always resolve to the dark channel:

```ts
{
  __paint: true,
  token: { light, dark, highContrast },
  options: { mode: "dark" }
}
```

### Using a PaintOptions object

```ts
const forcedHC = paint(
  suiColor.layers.accent.background.default,
  { mode: "highContrast" }
);
```

This is functionally identical, but allows future extension if more options are added.

### Why this matters
Mode forcing is useful when:

- building theme‑specific components

- authoring high‑contrast overrides

- creating internal color utilities

- ensuring deterministic output regardless of global theme state

PaintApi never resolves the color — it only tags it.
The paint engine handles resolution later.

## Partial Painters (paint.with)

**`paint.with()`** creates a partially‑applied paint function with predefined options.
This is useful when you want to consistently apply a specific theme mode or configuration across multiple color tokens without repeating the same options.

It returns a new function that behaves exactly like paint(), but automatically injects the provided PaintOptions.

### Creating a mode‑specific painter

```ts
import { paint, suiColor } from "@simplify/engine";

// Create a painter that always uses dark mode
const darkPaint = paint.with({ mode: "dark" });

// Apply it to any ModeColor token
const fg = darkPaint(suiColor.layers.accent.foreground.default);
```

This produces:

```ts
{
  __paint: true,
  token: { light, dark, highContrast },
  options: { mode: "dark" }
}

```

### Why this is useful

Partial painters are ideal for:

- building theme‑specific color bundles

- authoring dark‑mode or high‑contrast overrides

- creating internal utilities for consistent color application

- reducing repetition when many colors share the same mode requirement

### Composable and deterministic

paint.with() never mutates the original paint function.
It simply returns a new function that wraps tokens using the provided options.

This keeps paint values:

- rectangular

- predictable

- explicit

- fully structural

## Runtime Guard (isPaint)

isPaint() is a strict, type‑safe runtime guard for detecting PaintValue objects.
It works safely with unknown and avoids any, making it ideal for defensive checks inside compilers, resolvers, and internal utilities.

- A value is considered a PaintValue only if:

- it is an object

- it contains __paint: true

- it contains a token

- the token is a rectangular ModeColor with light, dark, and highContrast channels

### Basic Usage

```ts
import { isPaint, paint, suiColor } from "@simplify/engine";

const value = paint(suiColor.layers.accent.background.default);

if (isPaint(value)) {
  console.log(value.token.light); // Safe access
}
```

### Why this matters

isPaint() is essential when building:

- sheet compilers

- paint engines

- CSS variable resolvers

- theme mode transformers

- internal debugging tools

It ensures that only properly‑formed PaintValue objects enter the resolution pipeline, preventing accidental misuse of raw color tokens or malformed objects.

### Strict and deterministic

**`isPaint()`** does not rely on duck typing or loose heuristics.
It checks for full rectangularity and structural correctness, guaranteeing that every accepted value is safe to resolve.

## Using paint() with suiColor
In real usage, you will almost never construct ModeColor tokens manually with **`mc()`**.
Instead, you will use suiColor, the Fluent‑inspired palette that provides fully‑formed ModeColor tokens for every layer, semantic state, and interaction state.

suiColor contains rectangular color definitions for:

- layers.base

- layers.surface

- layers.elevated

- layers.raised

- layers.accent

- state.danger

- state.warning

- state.success

- state.info

Each entry is a ModeColor with light, dark, and highContrast channels.

### Example: Using paint() inside a sheet

```ts
import { suiSheet, paint, suiColor, tokens } from "@simplify/engine";

const gridItem = suiSheet({
  surface: {
    background: paint(suiColor.layers.accent.background.default)
  },
  sizing: {
    height: "300px"
  },
  spacing: {
    padding: 5
  },
  typography: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontWeight: tokens.typography.fontWeight.semibold
  }
});

```

### What happens here

1. suiColor.layers.accent.background.default  
is a ModeColor:

```ts
{
  light: "#0078d4",
  dark: "#2899f5",
  highContrast: "#0000ff"
}

```

2. paint() wraps that ModeColor into a PaintValue:

```ts
{
  __paint: true,
  token: { light, dark, highContrast },
  options: undefined
}

```

3. suiSheet() accepts the PaintValue as a structural color.
4. The paint engine resolves the correct channel based on the active theme mode.

### Why this matters

This pattern is the backbone of SimplifyUI’s color system:

- suiColor defines the palette

- **`paint()`** marks colors as mode‑aware

- sheets consume PaintValue structurally

- the paint engine resolves the final CSS variable

- This keeps color usage:

- deterministic

- theme‑aware

- rectangular

- fully declarative

## Summary

**`paintApi`** is the structural layer of SimplifyUI’s color system.
It does not resolve colors, compute channels, or generate CSS.
Instead, it provides a deterministic way to mark ModeColor tokens as paintable, ensuring they are handled correctly by the sheet compiler and paint engine.

1. PaintApi ensures that every color entering the rendering pipeline is:

2. Rectangular — always carrying `light`, `dark`, and `highContrast` channels.

3. Tagged — wrapped in a PaintValue with __paint: true.

4. Mode‑aware — optionally forced to a specific theme mode.

5. Composable — via **`paint.with()`** for reusable painters.

6. Runtime‑safe — validated using **`isPaint()`**.

In real usage:

- suiColor provides the ModeColor tokens

- **`paint()`** wraps them into PaintValues

- sheets consume PaintValues structurally

- the paint engine resolves the final color based on the active theme mode

- This separation keeps the system predictable, testable, and fully declarative.

PaintApi is small by design — but it is foundational.
It ensures that every color in SimplifyUI behaves consistently across light, dark, and high‑contrast modes, without inference or hidden behavior.
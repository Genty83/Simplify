# tokensApi — Introduction

`tokensApi` provides access to the live design token set used throughout the SimplifyUI styling engine.
Tokens define the foundational scales for layout, spacing, typography, motion, shape, and other core design primitives.
They are the lowest‑level building blocks of the system — neutral, minimal, and fully design‑system agnostic.

The token engine is intentionally mutable.
Calling `setTokens()` deep‑merges overrides into the active token set, enabling:

- runtime theming

- user‑defined customization

- dynamic typography updates

- theme provider integration

- SSR hydration and testing workflows

All token categories follow the same five‑step semantic scale:

```
xsmall → small → medium → large → xlarge
```

This scale is shared across all eight design principles:

1. layout

2. surface

3. shape

4. motion

5. sizing

6. spacing

7. typography

8. interaction

The default token values are deliberately unopinionated.
They provide a functional baseline without imposing a visual identity.
Higher‑level systems — such as SimplifyUI’s semantic roles, component tokens, and themed variations — build on top of this foundation.

The tokens API is small but essential:

- `getTokens()` returns the active token set

- `setTokens()` deep‑merges overrides

- `resetTokens()` restores defaults

This predictable, rectangular structure ensures that every part of the engine — utilities, sheets, responsive rules, paint layers, and theme providers — can rely on a consistent, deterministic token contract.

## Basic Usage

The token engine exposes the active token set through getTokens().
Tokens are plain values — strings and numbers — organized into eight semantic categories that mirror the core design principles of SimplifyUI:

- layout
- surface
- shape
- motion
- sizing
- spacing
- typography
- interaction

Each category uses the shared five‑step semantic scale:

```
xsmall → small → medium → large → xlarge
```

These values are neutral and unopinionated. They provide a functional baseline for spacing, sizing, typography, motion, and other primitives without imposing a visual identity.

## Accessing tokens

```ts
import { getTokens } from "@simplify/engine";

const t = getTokens();

console.log(t.spacing.space.medium);      // "8px"
console.log(t.typography.fontSize.large); // "16px"
console.log(t.motion.duration.small);     // "100ms"
```

## Using tokens inside sheets

Tokens are typically consumed directly inside suiSheet:

```ts
import { suiSheet, getTokens } from "@simplify/engine";

const t = getTokens();

const card = suiSheet({
  spacing: {
    padding: t.spacing.space.large
  },
  shape: {
    radius: t.shape.radius.medium
  },
  typography: {
    fontSize: t.typography.fontSize.medium,
    fontWeight: t.typography.fontWeight.semibold
  }
});
```

## Using the static tokens export

In addition to `getTokens()`, the engine also exports a static tokens object.
This object contains the default token values exactly as defined in tokens.ts, without any runtime overrides applied.

You can import it directly:

```ts
import { tokens } from "@simplify/engine";

console.log(tokens.typography.fontFamily.sans);   // "system-ui, sans-serif"
console.log(tokens.spacing.space.medium);         // "8px"
console.log(tokens.shape.radius.large);           // "8px"
```

### When to use the static tokens

Use the static tokens export when:

- you want the default values
- your component does not need to react to runtime theming
- you are writing examples, demos, or documentation
- you want deterministic, non‑mutable values
- you are building components that do not depend on user overrides

### Example: using static tokens inside sheets

```ts
import { suiSheet, tokens } from "@simplify/engine";

const gridItem = suiSheet({
  typography: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontWeight: tokens.typography.fontWeight.semibold
  },
  spacing: {
    padding: tokens.spacing.space.large
  }
});
```
This is perfectly valid and often simpler than calling `getTokens()`.

### Static vs. live Tokens

| Access method | Returns | Reacts to setTokens() | Use case |
| --- | --- | --- | --- |
| ``tokens`` | default token values | ❌ no | static components, docs, demos |
| ``getTokens()`` | active token set | ✔ yes | theme‑aware components, runtime theming |

Both are correct — the choice depends on whether your component needs to respond to runtime overrides.

## setTokens()

setTokens() deep‑merges a partial token object into the active token set.
This allows applications to override any part of the token contract at runtime — typography, spacing, motion, shape, layout, and more.

### Signature

```ts
function setTokens(partial: Partial<SuiTokenOverrides>): void;
```

### What setTokens() does

- Performs a deep merge
- Preserves the full SuiTokens shape
- Updates only the provided values
- Leaves all other values untouched
- Mutates the live token set (activeTokens)
- Immediately affects any component using getTokens()

### Example: updating typography

```ts
import { setTokens } from "@simplify/engine";

setTokens({
  typography: {
    fontFamily: {
      sans: "Inter, system-ui, sans-serif"
    }
  }
});
```

After this call:

```ts
getTokens().typography.fontFamily.sans;
// → "Inter, system-ui, sans-serif"
```

### Example: updating spacing

```ts
setTokens({
  spacing: {
    space: {
      medium: "10px"
    }
  }
});
```

Only spacing.space.medium changes — all other spacing values remain intact.

### Example: updating multiple categories

```ts
setTokens({
  typography: {
    fontSize: { large: "18px" }
  },
  motion: {
    duration: { small: "120ms" }
  }
});
```

### Deep merge behavior

`setTokens()` uses the engine’s deterministic `deepMerge()` function:

- no index signatures
- no branching
- no inference
- no mutation of defaults
- strictly typed
- rectangular

This ensures overrides are predictable and safe.

When to use `setTokens()`
Use `setTokens()` when you need:

- runtime theming
- user customization
- dynamic typography updates
- brand‑specific token overrides
- theme provider integration
- SSR hydration resets

When NOT to use `setTokens()`

Avoid `setTokens()` when:

- you only need static values
- your component does not depend on runtime theming
- you want deterministic, non‑mutable tokens
- you are writing documentation or demos

In those cases, use the static tokens export instead

## resetTokens()

`resetTokens()` restores the active token set back to the default values defined in tokens.ts.
It completely clears any overrides applied via `setTokens()` and re‑initializes the live token object using a fresh structuredClone of the defaults.

### Signature

```ts
function resetTokens(): void;
```

### What resetTokens() does

- discards all runtime overrides
- restores the original baseline token values
- re‑creates the live token object (activeTokens)
- ensures a clean, deterministic token state

This is especially useful in environments where token state must be predictable.

### Example

```ts
import { resetTokens, getTokens } from "@simplify/engine";

resetTokens();

console.log(getTokens().typography.fontSize.medium);
// → "14px" (default value)
```

### When to use resetTokens()

Use `resetTokens()` when you need:

- #### theme resets  
Returning the UI to its default design state.

- #### testing  
Ensuring each test starts with a clean token environment.

- #### SSR hydration  
Guaranteeing the server and client begin with identical token values.

- #### development tooling  
Allowing designers or developers to revert overrides quickly.

### When NOT to use resetTokens()

Avoid calling `resetTokens()`:

- inside components
- inside sheets
- inside utilities
- inside render loops

It should only be used at application boundaries, not inside UI logic.

### resetTokens() and getTokens()

After calling `resetTokens()`:

- `getTokens()` returns the restored defaults
- the static tokens export remains unchanged (it always contains defaults)
- any previous overrides applied via setTokens() are fully removed

## Deep Merge Behavior

The token engine uses a deterministic deepMerge() function to apply overrides.
This merge strategy is intentionally minimal, predictable, and fully typed.
It ensures that partial updates never break the rectangular SuiTokens contract.

### Characteristics of the merge

- #### Deep, not shallow  
Nested objects are merged recursively.

- #### Typed, not dynamic  
Only keys defined in SuiTokens are allowed.

- #### Rectangular, not inferred  
The full token shape is always preserved.

- #### Deterministic, not heuristic  
No branching, no special cases, no inference.

- #### Pure, not mutative  
deepMerge() returns a new object; the engine assigns it to activeTokens.

### How merging works
If both values are objects:

```ts
current = { medium: "8px", large: "12px" }
next    = { medium: "10px" }

result  = { medium: "10px", large: "12px" }
```

If the next value is not an object:

```ts
current = "8px"
next    = "10px"

result  = "10px"
```

### Example: merging nested values

```ts
setTokens({
  typography: {
    fontSize: {
      medium: "15px"
    }
  }
});
```

Resulting typography scale:

```ts
{
  xsmall: "10px",
  small: "12px",
  medium: "15px", // updated
  large: "16px",
  xlarge: "20px"
}
```

Only the provided value changes — everything else remains intact.

### Example: merging multiple categories

```ts
setTokens({
  spacing: {
    space: { large: "14px" }
  },
  motion: {
    duration: { small: "120ms" }
  }
});
```

This updates:

- spacing.space.large
- motion.duration.small

Everything else stays the same.

What deepMerge() never does

- ❌ It never deletes keys
- ❌ It never infers missing values
- ❌ It never merges arrays
- ❌ It never mutates the default token object
- ❌ It never changes the token shape

This ensures that the token system remains stable and predictable, even under heavy runtime customization.

## Runtime Theming Examples

The token engine enables dynamic, runtime theming by allowing applications to override any part of the token contract using `setTokens()`.
These overrides take effect immediately and are reflected in all components that read from `getTokens()`.

Below are common real‑world patterns.

### 1. Updating typography at runtime

A user selects a new font in a settings panel:

```ts
import { setTokens } from "@simplify/engine";

function applyFont(font: string) {
  setTokens({
    typography: {
      fontFamily: { sans: font }
    }
  });
}
```

All components using:

```ts
getTokens().typography.fontFamily.sans
```

will update instantly.

### 2. Adjusting spacing scale for compact mode

```ts
setTokens({
  spacing: {
    space: {
      small: "2px",
      medium: "4px",
      large: "8px"
    }
  }
});
```

This creates a tighter UI without touching component code.

### 3. Increasing motion duration for accessibility

```ts
setTokens({
  motion: {
    duration: {
      small: "150ms",
      medium: "200ms",
      large: "300ms"
    }
  }
});
```

Useful for “reduce motion” or “slow transitions” accessibility settings.

### 4. Brand‑specific radius and border updates

```ts
setTokens({
  shape: {
    radius: {
      medium: "10px",
      large: "14px"
    }
  }
});
```

This instantly changes the rounding across all components that use tokenized radii.

### 5. Applying a theme preset

A theme provider or settings menu can apply a full preset:

```ts
setTokens({
  typography: {
    fontFamily: { sans: "Inter, system-ui, sans-serif" },
    fontWeight: { semibold: 650 }
  },
  spacing: {
    space: { medium: "10px" }
  },
  shape: {
    radius: { large: "12px" }
  }
});
```

This is how SimplifyUI will support theme packs, brand kits, and user personalization.

### 6. Resetting back to defaults

```ts
import { resetTokens } from "@simplify-engine";

resetTokens();
```

This is commonly used when switching themes or resetting user preferences.

## Live vs static tokens in theming

Runtime theming affects:

- getTokens() ✔
- components using getTokens() ✔
- utilities using getTokens() ✔

Runtime theming does not affect:

- the static tokens export ✘
- components using tokens ✘

This distinction is what makes the token engine both flexible and predictable.

## Integration with Sheets

Tokens flow directly into `suiSheet`, powering spacing, sizing, typography, motion, shape, and layout primitives.
Sheets do not transform tokens — they simply consume them as raw values.

### Static tokens inside sheets
If your component does not need runtime theming, you can use the static `tokens` export:

```ts
import { suiSheet, tokens } from "@simplify/engine";

const card = suiSheet({
  spacing: {
    padding: tokens.spacing.space.large
  },
  typography: {
    fontFamily: tokens.typography.fontFamily.sans,
    fontWeight: tokens.typography.fontWeight.semibold
  }
});
```

This is deterministic and ideal for components that never change theme.

### Live tokens inside sheets

If your component should respond to runtime overrides, use `getTokens()`:

```ts
import { suiSheet, getTokens } from "@simplify/engine";

const t = getTokens();

const card = suiSheet({
  spacing: {
    padding: t.spacing.space.large
  },
  shape: {
    radius: t.shape.radius.medium
  }
});
```

Any call to `setTokens()` will immediately update all sheets that reference `t`.

### Responsive tokens

Tokens work seamlessly with responsive rules:

```ts
const t = getTokens();

const grid = suiSheet({
  layout: {
    gap: {
      mobile: t.spacing.space.small,
      tablet: t.spacing.space.medium,
      laptop: t.spacing.space.large
    }
  }
});
```

Responsive values remain structural — tokens simply fill the slots.

### Tokens inside layers

Sheets can be layered using `.asLayer()`, and tokens remain fully compatible:

```ts
const layoutLayer = suiSheet({
  spacing: {
    padding: tokens.spacing.space.medium
  }
}).asLayer("layout");
```

Layers do not alter token behavior; they only affect class composition.

### Tokens + paint + color

Tokens integrate cleanly with paint and color layers:

```ts
surface: {
  background: paint(suiColor.layers.accent.background.default, "dark")
},
typography: {
  fontFamily: tokens.typography.fontFamily.sans
}
```

Tokens provide structural values; paint provides mode‑aware colors.

### Tokens + ARIA

ARIA sheets can be combined with token‑driven layout sheets:

```ts
<div className={grid} {...gridAria}>
```

Tokens do not interact with ARIA directly — they simply style the components that ARIA annotates.

## Summary

`tokensApi` is the foundational layer of SimplifyUI’s design system.
It provides a predictable, rectangular token contract that powers every styling subsystem — sheets, responsive rules, paint layers, utilities, and the upcoming theme provider.

The token engine is intentionally mutable, enabling runtime theming and user‑driven customization.
Developers can override any part of the token set using `setTokens()`, inspect the live values with `getTokens()`, and restore defaults with `resetTokens()`.

Tokens themselves are:

- neutral
- minimal
- unopinionated
- design‑system agnostic
- fully typed
- structurally consistent

They follow a shared five‑step semantic scale:

```Code
xsmall → small → medium → large → xlarge
```

This scale spans all eight design principles:

- layout
- surface
- shape
- motion
- sizing
- spacing
- typography
- interaction

The engine’s deep‑merge behavior ensures overrides are safe, deterministic, and strictly typed.
Sheets consume tokens directly as raw values, allowing components to respond instantly to runtime updates when using getTokens(), or remain static when using the default tokens export.

In short:

`tokens` → static defaults

`getTokens()` → live, mutable token set

`setTokens()` → deep‑merge overrides

`resetTokens()` → restore defaults

This simple, stable API forms the backbone of SimplifyUI’s styling architecture, enabling both predictable design primitives and flexible runtime theming.
# suiAria - User Guide

## Introduction

suiAria provides a deterministic, structural way to apply WAI‑ARIA roles and attributes to your components.
It groups ARIA needs into a single object that can be spread directly onto an HTML element or JSX node.

The API is intentionally minimal:

- no inference

- no automatic defaults

- no DOM dependency

- no prototype pollution

Everything emitted is explicit and predictable.

## Basic Usage 

```ts 
import { suiAria } from "@simplify-engine";

const gridAria = suiAria({
  aria: {
    "aria-labelledby": "main grid"
  },
  role: "grid"
});

<div className={grid} {...gridAria}></div>
```

suiAria() returns a plain object containing only the keys you provided.

## Roles

You can pass any strongly‑typed WAI‑ARIA role:

```ts
const buttonAria = suiAria({
  role: "button"
});

<button {...buttonAria}>Submit</button>
```

## Structural ARIA Attributes
suiAria accepts any attribute defined in AriaAttributes:

```ts
const inputAria = suiAria({
  aria: {
    "aria-describedby": "email-help",
    "aria-label": "Email address"
  }
});

<input type="email" {...inputAria} />

```

## Boolean ARIA States

Use ariaState() to emit boolean ARIA attributes based on the canonical ariaStateMap.

```ts
import { ariaState } from "@simplify/engine";

const expanded = ariaState({
  ariaExpanded: true,
  ariaDisabled: false
});

// → { "aria-expanded": true, "aria-disabled": false }

```

Then combine it with suiAria:

```ts
const disclosureAria = suiAria({
  role: "button",
  aria: {
    ...ariaState({ ariaExpanded: true })
  }
});

```

## Ergonomic Helpers

### ariaLabel()

```ts
import { ariaLabel } from "@simplify/engine";

const labelAria = ariaLabel("Main navigation");

<nav {...labelAria}></nav>
```

### ariaHidden()

```ts
import { ariaHidden } from "@simplify/engine";

<div {...ariaHidden()} />
```

You can also pass a boolean:

```ts
<div {...ariaHidden(false)} />

```

## Combining Everything

A realistic component example:

```ts
import { suiAria, ariaState, ariaLabel } from "@simplify/engine";

function AccordionItem({ open }) {
  const aria = suiAria({
    role: "button",
    aria: {
      ...ariaLabel("Toggle section"),
      ...ariaState({ ariaExpanded: open })
    }
  });

  return (
    <div className="accordion-item" {...aria}>
      Section
    </div>
  );
}

```

Everything is structural, explicit, and predictable.

## Design Principles
suiAria follows the same engine rules as other subsystems:

- Deterministic output

- Prototype‑free objects

- Explicit emission only

- Single source of truth via ariaStateMap

- No inference

This keeps ARIA usage safe, predictable, and easy to reason about.

## Summary

suiAria is a small but essential part of the Simplify Engine:

- It groups ARIA roles and attributes into a single structural object.

- It provides ergonomic helpers for common attributes.

- It ensures boolean ARIA states are emitted consistently.

- It keeps your components accessible without adding complexity.
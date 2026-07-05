# Simplify Engine

<p align="center">
  <img src="./assets/logo.svg" alt="Simplify Engine" width="180" />
</p>

<p align="center">
  <strong>An atomic styling engine for modern JavaScript and TypeScript applications.</strong>
</p>

<p align="center">
  Type-safe • Framework Agnostic • Zero Configuration • Performance First
</p>

<p align="center">

![Version](https://img.shields.io/badge/version-v1.0.0-2563eb?style=for-the-badge)
![Tests](https://img.shields.io/badge/tests-403%20passing-success?style=for-the-badge)
![Coverage](https://img.shields.io/badge/coverage-100%25-success?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge\&logo=typescript\&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

</p>

---

## Overview

Simplify Engine is a fully typed atomic styling engine that compiles JavaScript and TypeScript style objects into deterministic, deduplicated CSS.

Rather than writing traditional CSS, you describe your interface using structured objects. Simplify automatically compiles those objects into highly optimized atomic CSS, injects the generated rules into a single shared stylesheet, and returns deterministic class names ready to use in your application.

Designed around eight core engineering principles, Simplify emphasizes predictability, maintainability, performance, and an exceptional developer experience.

---

## Why Simplify?

* Zero configuration
* Full TypeScript IntelliSense
* Atomic CSS generation
* Automatic rule deduplication
* Built-in responsive values
* Native state modifiers
* First-class design tokens
* Theme support
* Framework agnostic
* Deterministic compilation
* Tree-shakeable architecture
* Fully tested

---

## Installation

```bash
npm install @simplify/engine
```

or

```bash
pnpm add @simplify/engine
```

or

```bash
yarn add @simplify/engine
```

---

## Quick Example

```ts
import { suiSheet } from "@simplify/engine";

const button = suiSheet({
  usingBreakpoints: ["mobile", "tablet"],

  layout: {
    display: "flex",
    justifyContent: "center",
    alignItems: {
      mobile: "center",
      tablet: "start"
    }
  },

  spacing: {
    paddingInline: 16,
    paddingBlock: 10
  },

  typography: {
    fontWeight: 600
  },

  surface: {
    background: "#2563eb",
    color: "#ffffff"
  }
});
```

```tsx
<button className={button}>
  Simplify
</button>
```

Every call to `suiSheet()` is compiled into atomic CSS, deduplicated across your application, and injected into a single shared stylesheet.

No CSS files.

No runtime parser.

No configuration.

---

## Core Principles

Simplify is built around eight engineering principles that influence every API and compiler decision:

* Atomic by Design
* Type Safety First
* Zero Configuration
* Predictable Compilation
* Deterministic Output
* Composition over Inheritance
* Framework Independence
* Performance First

These principles ensure that every generated stylesheet is consistent, scalable, and maintainable.

---

## Documentation

The documentation covers every aspect of the engine, including:

* Installation
* Getting Started
* Core Concepts
* Style Sheets
* Responsive Values
* States
* Design Tokens
* Themes
* Animations
* Global Styles
* API Reference
* Examples

---

## Browser Support

Simplify targets modern browsers supporting ES2020 modules.

---

## Contributing

Contributions, bug reports, feature requests, and discussions are always welcome.

Please read the contributing guide before opening an issue or pull request.

---

## License

Released under the MIT License.

Copyright © Craig Gent.

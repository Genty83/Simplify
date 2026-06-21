/******************************************************************************
 * SimplifyUI Class Composer (`sui`)
 *
 * The `sui()` function is the canonical class name composer for SimplifyUI.
 *
 * It provides a unified way to combine:
 *
 * - **Raw class names**  
 *   `"flex"`, `"p-4"`, `"text-center"`
 *
 * - **Conditional classes**  
 *   `isActive && "btn-active"`
 *
 * - **Simplify utility objects**  
 *   Objects produced by the utility engine that contain:
 *   ```ts
 *   { __utility: true, atomize(): string }
 *   ```
 *   These are automatically converted into atomic class names.
 *
 * - **Falsy values**  
 *   (`false`, `null`, `undefined`, `""`) which are ignored entirely.
 *
 * The output is a **space‑joined**, **order‑preserving**, **zero‑allocation**
 * string of class names suitable for direct use in:
 *
 * - JSX (`className={sui(...)}`
 * - HTML templating engines
 * - Server‑side rendering pipelines
 * - Any environment where deterministic class composition is required
 *
 * -----------------------------------------------------------------------------
 * Why `sui()` exists
 * -----------------------------------------------------------------------------
 *
 * SimplifyUI generates atomic class names at runtime. These class names must be:
 *
 * - **Composable** — utilities and raw classes must mix seamlessly  
 * - **Predictable** — order must be preserved  
 * - **Minimal** — no hidden logic, no deduping, no surprises  
 * - **Fast** — called thousands of times in large apps  
 *
 * `sui()` is intentionally tiny and avoids:
 *
 * - deep type inspection  
 * - recursion  
 * - array flattening  
 * - deduplication  
 * - validation  
 *
 * It is a *pure concatenation engine* with first‑class support for Simplify utilities.
 *
 * -----------------------------------------------------------------------------
 * Utility Object Handling
 * -----------------------------------------------------------------------------
 *
 * Any object with:
 * ```ts
 * { __utility: true, atomize(): string }
 * ```
 * is treated as a Simplify utility and converted into its atomic class name.
 *
 * This allows:
 * ```ts
 * sui("grid", gap(12), padding(8))
 * ```
 * to produce:
 * ```
 * "grid sui-g4h2k sui-a9d3f"
 * ```
 *
 * -----------------------------------------------------------------------------
 * Falsy Value Handling
 * -----------------------------------------------------------------------------
 *
 * The following values are ignored:
 *
 * - `false`
 * - `null`
 * - `undefined`
 * - `""`
 *
 * This enables ergonomic conditional composition:
 *
 * ```ts
 * sui("btn", isPrimary && "btn-primary")
 * ```
 *
 * -----------------------------------------------------------------------------
 * Performance Characteristics
 * -----------------------------------------------------------------------------
 *
 * - Single pass over inputs  
 * - No array allocations  
 * - No recursion  
 * - No deduplication  
 * - No regex  
 *
 * This makes `sui()` extremely fast and suitable for hot paths.
 *
 * -----------------------------------------------------------------------------
 * @example
 * // Basic usage
 * sui("flex", "items-center")
 * // → "flex items-center"
 *
 * @example
 * // Conditional classes
 * sui("btn", isActive && "btn-active")
 *
 * @example
 * // Utility objects
 * const gap = gapUtility(12); // { __utility: true, atomize() { ... } }
 * sui("grid", gap)
 * // → "grid sui-a1b2c"
 *
 * @example
 * // Mixed inputs
 * sui("p-4", false, null, undefined, gap, "rounded")
 * // → "p-4 sui-a1b2c rounded"
 ***************************************************************************** */

/**
 * @function sui
 * @description
 * Composes class names and Simplify utility objects into a single
 * space‑delimited string.
 *
 * @param inputs - A variadic list of class names, falsy values, or utility objects.
 * @returns A space‑joined string of class names.
 */
export function sui(
  ...inputs: Array<
    string | false | null | undefined | { __utility?: true; atomize?: () => string }
  >
): string {
  let output = "";

  for (let i = 0; i < inputs.length; i++) {
    let value = inputs[i];

    // Utility object → atomized class name
    if (
      value &&
      typeof value === "object" &&
      value.__utility &&
      typeof value.atomize === "function"
    ) {
      value = value.atomize();
    }

    // Skip falsy values
    if (!value) continue;

    // Append with space delimiter
    output += (output ? " " : "") + value;
  }

  return output;
}

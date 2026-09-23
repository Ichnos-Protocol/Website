/*
 * Shared corpus-scan infrastructure for vocabulary.test.js and routes.test.js.
 * Listed in vocabulary.js's SKIP_FILES: a scanner must not scan its own regex
 * and comment sources.
 */

// An unused uppercase import survives lint (varsIgnorePattern: "^[A-Z_]") and a
// comment mention satisfies a raw text search, so both are removed before the
// identifier is counted. Import stripping is multiline-aware: a line filter
// misses the identifier inside a multiline `import { … }` block. The side-effect
// form is stripped first so its statement cannot be swallowed by the `from`
// form's non-greedy span. `import` must be followed by whitespace or a quote,
// so a dynamic `import(` is never stripped.
export function stripNonConsuming(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1")
    .replace(/^import\s*['"][^'"]*['"];?/gm, "")
    .replace(/^import\s[\s\S]*?from\s*['"][^'"]*['"];?/gm, "");
}

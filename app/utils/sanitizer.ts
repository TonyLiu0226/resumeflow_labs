/**
 * Escape a plain-text string so it can be safely embedded in a LaTeX document.
 *
 * The replacement order matters:
 *   1. Replace `\` with a sentinel so later steps don't corrupt it.
 *   2. Escape `{` and `}` before any replacement that introduces them.
 *   3. Escape the remaining special characters.
 *   4. Replace the sentinel with `\textbackslash{}`.
 *   5. Replace `~` and `^` last (they introduce `{}` which must not be re-escaped).
 */
export function escapeLatex(str: string): string {
    return str
    .replace(/\\/g, "\x00BACKSLASH\x00")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\x00BACKSLASH\x00/g, "\\textbackslash{}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
  }

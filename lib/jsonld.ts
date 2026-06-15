/**
 * Serialize an object for embedding in a <script type="application/ld+json">
 * via dangerouslySetInnerHTML. JSON.stringify alone does NOT escape characters
 * that can break out of a <script> element (`<`, `>`, `&`) or the JS line
 * terminators (U+2028/U+2029), so we neutralize them. This prevents a stored
 * value in the inventory data from injecting markup into the page.
 */
const LS = String.fromCharCode(0x2028); // line separator
const PS = String.fromCharCode(0x2029); // paragraph separator

export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .split(LS)
    .join("\\u2028")
    .split(PS)
    .join("\\u2029");
}

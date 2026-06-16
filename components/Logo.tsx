type LogoProps = {
  /** Rendered logo height in pixels. */
  height?: number;
  className?: string;
};

/**
 * Sahar Motors logo (silver S/M monogram + wordmark on black). It's used only
 * on the dark navy header/footer, so `mix-blend-lighten` drops the black
 * background and leaves just the silver artwork — no separate transparent
 * asset needed. Replace public/logo.jpg to change it.
 */
export default function Logo({ height = 88, className }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.jpg"
      alt="Sahar Motors"
      style={{ height }}
      className={`w-auto select-none mix-blend-lighten ${className ?? ""}`}
    />
  );
}

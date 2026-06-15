type LogoProps = {
  /** Show the "SAHAR MOTORS" wordmark next to the emblem. */
  withWordmark?: boolean;
  /** Emblem size in pixels. */
  size?: number;
  className?: string;
};

/**
 * Brand lockup. The emblem is fixed navy + crimson; the wordmark inherits
 * `currentColor` for "SAHAR" so it adapts to dark/light backgrounds, with
 * "MOTORS" always in the brand accent.
 */
export default function Logo({
  withWordmark = true,
  size = 44,
  className,
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect width="48" height="48" rx="12" fill="#0b2545" />
        <rect y="34" width="48" height="14" rx="0" fill="#c8102e" opacity="0.0" />
        <path d="M6 38h36" stroke="#c8102e" strokeWidth="3" strokeLinecap="round" />
        <g
          transform="translate(11,9) scale(1.08)"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </g>
      </svg>
      {withWordmark && (
        <span className="text-base font-extrabold uppercase leading-none tracking-[0.18em]">
          Sahar <span className="text-brand-500">Motors</span>
        </span>
      )}
    </span>
  );
}

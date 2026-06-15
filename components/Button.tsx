import Link from "next/link";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700",
  secondary: "bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950",
  outline:
    "border border-navy-300 bg-white text-navy-900 hover:border-navy-900 hover:bg-navy-50",
  ghost: "text-navy-900 hover:bg-navy-100",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm sm:text-base",
  lg: "px-6 py-3 text-base",
};

type ButtonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  /** Provide href to render a link; omit to render a <button>. */
  href?: string;
  /** Force opening in a new tab (auto for http links is left to the caller). */
  external?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
  title?: string;
};

/** Polymorphic button — renders a Next <Link>, plain <a>, or <button>. */
export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  href,
  external,
  type = "button",
  onClick,
  disabled,
  "aria-label": ariaLabel,
  title,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className ?? ""}`;

  if (href !== undefined) {
    const isAbsolute = external || /^(https?:|mailto:|tel:)/.test(href);
    if (isAbsolute) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={ariaLabel}
          title={title}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} aria-label={ariaLabel} title={title}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      aria-label={ariaLabel}
      title={title}
    >
      {children}
    </button>
  );
}

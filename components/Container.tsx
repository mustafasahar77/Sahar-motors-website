type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

/** Centered, max-width page gutter used across all sections. */
export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className ?? ""}`}>
      {children}
    </div>
  );
}

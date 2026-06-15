"use client";

import { useState } from "react";

const FALLBACK = "/inventory/placeholder-navy.svg";

type VehicleImageProps = {
  src?: string;
  alt: string;
  className?: string;
  /** Eager-load above-the-fold images (e.g. first gallery photo). */
  priority?: boolean;
  sizes?: string;
};

/**
 * Plain <img> (the export is `images.unoptimized`, so there's nothing to gain
 * from next/image) that degrades to the branded placeholder when a
 * dealer-supplied photo path is missing or fails to load.
 */
export default function VehicleImage({
  src,
  alt,
  className,
  priority,
}: VehicleImageProps) {
  const [failed, setFailed] = useState(false);
  const finalSrc = failed || !src ? FALLBACK : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => {
        if (!failed) setFailed(true);
      }}
      className={className}
    />
  );
}

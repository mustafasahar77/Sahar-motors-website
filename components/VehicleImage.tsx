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
  // Track the specific src that failed (not a sticky boolean) so navigating from
  // a broken photo to a valid one — e.g. in CarGallery, where one persistent
  // <img> instance's src changes — correctly shows the new photo instead of
  // latching the placeholder for the rest of the gallery.
  const [failedSrc, setFailedSrc] = useState<string | undefined>(undefined);
  const finalSrc = !src || failedSrc === src ? FALLBACK : src;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => {
        if (failedSrc !== src) setFailedSrc(src);
      }}
      className={className}
    />
  );
}

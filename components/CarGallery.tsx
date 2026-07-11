"use client";

import { useRef, useState } from "react";
import VehicleImage from "@/components/VehicleImage";
import { useDialog } from "@/lib/useDialog";
import { ChevronLeft, ChevronRight, Camera, Expand, X } from "@/components/icons";

type CarGalleryProps = {
  images: string[];
  title: string;
};

export default function CarGallery({ images, title }: CarGalleryProps) {
  const photos = images.length > 0 ? images : [undefined];
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const closeFullscreen = () => setFullscreen(false);
  // Esc-to-close + focus trap + scroll lock while the lightbox is open.
  const lightboxRef = useDialog<HTMLDivElement>(fullscreen, closeFullscreen);

  // Guard against the active index drifting out of range.
  const index = Math.min(active, photos.length - 1);
  const count = photos.length;

  function go(delta: number) {
    setActive((i) => {
      const next = (i + delta + count) % count;
      return next;
    });
  }

  // Swipe left/right flips photos (the gesture every phone shopper tries first).
  // Mostly-vertical moves are ignored so normal page scrolling is unaffected.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s || count <= 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? 1 : -1);
  };

  return (
    <div>
      <div
        className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-navy-100"
        tabIndex={count > 1 ? 0 : -1}
        role={count > 1 ? "group" : undefined}
        aria-label={count > 1 ? `${title} photo gallery` : undefined}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onKeyDown={(e) => {
          if (count <= 1) return;
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          }
        }}
      >
        <button
          type="button"
          className="block h-full w-full cursor-zoom-in"
          onClick={() => images.length > 0 && setFullscreen(true)}
          aria-label="View photo fullscreen"
        >
          <VehicleImage
            src={photos[index]}
            alt={`${title} — photo ${index + 1} of ${count}`}
            priority
            className="h-full w-full object-cover"
          />
        </button>

        {images.length > 0 && (
          <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white">
            <Expand size={13} /> Tap to enlarge
          </span>
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white transition hover:bg-black/65"
            >
              <ChevronRight size={22} />
            </button>
            <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-1 text-xs font-medium text-white">
              <Camera size={13} /> {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              className={`relative aspect-[4/3] overflow-hidden rounded-md ring-2 transition ${
                i === index
                  ? "ring-brand-500"
                  : "ring-transparent hover:ring-navy-300"
              }`}
            >
              <VehicleImage
                src={src}
                alt={`${title} thumbnail ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      {fullscreen && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} photo viewer`}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onKeyDown={(e) => {
            if (count <= 1) return;
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              go(-1);
            } else if (e.key === "ArrowRight") {
              e.preventDefault();
              go(1);
            }
          }}
        >
          <div className="flex items-center justify-between p-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 text-sm font-medium text-white">
              <Camera size={14} /> {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={closeFullscreen}
              aria-label="Close fullscreen viewer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X size={22} />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[index] || "/inventory/placeholder-navy.svg"}
              alt={`${title} — photo ${index + 1} of ${count}`}
              className="max-h-full max-w-full select-none object-contain"
              draggable={false}
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                >
                  <ChevronLeft size={26} />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

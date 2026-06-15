"use client";

import { useState } from "react";
import VehicleImage from "@/components/VehicleImage";
import { ChevronLeft, ChevronRight, Camera } from "@/components/icons";

type CarGalleryProps = {
  images: string[];
  title: string;
};

export default function CarGallery({ images, title }: CarGalleryProps) {
  const photos = images.length > 0 ? images : [undefined];
  const [active, setActive] = useState(0);

  // Guard against the active index drifting out of range.
  const index = Math.min(active, photos.length - 1);
  const count = photos.length;

  function go(delta: number) {
    setActive((i) => {
      const next = (i + delta + count) % count;
      return next;
    });
  }

  return (
    <div>
      <div
        className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-navy-100"
        tabIndex={count > 1 ? 0 : -1}
        role={count > 1 ? "group" : undefined}
        aria-label={count > 1 ? `${title} photo gallery` : undefined}
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
        <VehicleImage
          src={photos[index]}
          alt={`${title} — photo ${index + 1} of ${count}`}
          priority
          className="h-full w-full object-cover"
        />

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
    </div>
  );
}

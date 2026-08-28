"use client";

import { useState } from "react";

export interface ReceiptImage {
  id: number;
  src: string;
}

export default function ReceiptImageViewer({
  images,
  alt,
}: {
  images: ReceiptImage[];
  alt: string;
}) {
  const [openSrc, setOpenSrc] = useState<string | null>(null);

  return (
    <>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {images.map((image) => (
          <button
            type="button"
            key={image.id}
            onClick={() => setOpenSrc(image.src)}
            className="flex-none"
            aria-label="원본 이미지 확대"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={alt}
              className="h-56 w-auto rounded-2xl border border-neutral-100 object-cover"
            />
          </button>
        ))}
      </div>

      {openSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setOpenSrc(null)}
        >
          <button
            type="button"
            onClick={() => setOpenSrc(null)}
            aria-label="닫기"
            className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-xl text-white active:bg-white/20"
          >
            &times;
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={openSrc}
            alt={alt}
            className="max-h-full max-w-full rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

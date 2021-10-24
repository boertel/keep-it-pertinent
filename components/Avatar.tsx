/* eslint-disable @next/next/no-img-element */
import cn from "classnames";
import { useEffect, useRef, useCallback } from "react";

export default function Avatar({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const ref = useRef<HTMLImageElement>(null);

  const callback = useCallback(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && src) {
        const img = new window.Image();
        img.onload = () => {
          entry.target.classList.remove("bg-gray-700");
          entry.target.src = src;
        };
        img.src = src;

        if (ref.current && observer.current) {
          observer.current.unobserve(ref.current);
        }
      }
    },
    [src]
  );

  const observer = useRef<IntersectionObserver>();

  useEffect(() => {
    observer.current = new IntersectionObserver(callback);
    if (ref.current) {
      observer.current.observe(ref.current);
    }
  }, [callback]);

  return (
    <div
      className={cn(
        className,
        "z-20 w-12 h-12 flex-shrink-0 border-2 rounded-full transition-colors"
      )}
    >
      <img
        alt={alt}
        ref={ref}
        style={{ fontSize: "0px" }}
        className={cn(
          "rounded-full border-4 border-black transition-colors min-w-full min-h-full bg-gray-700"
        )}
      />
    </div>
  );
}

function checkVisibility(
  boundingClientRect: DOMRect,
  partial: boolean = false
): boolean {
  const { top, right, bottom, left, width, height } = boundingClientRect;

  if (top + right + bottom + left === 0) {
    return false;
  }

  const topCheck = partial ? top + height : top;
  const bottomCheck = partial ? bottom - height : bottom;
  const rightCheck = partial ? right - width : right;
  const leftCheck = partial ? left + width : left;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  console.log(topCheck, leftCheck);

  return (
    topCheck >= 0 &&
    leftCheck >= 0 &&
    bottomCheck <= windowHeight &&
    rightCheck <= windowWidth
  );
}

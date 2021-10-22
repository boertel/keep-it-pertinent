// eslint-disable @next/next/no-img-element
import cn from "classnames";
import { useEffect, useState, useRef, useCallback } from "react";

interface Window {
  Image: {
    prototype: HTMLImageElement;
    new (): HTMLImageElement;
  };
}

function useImageOnLoad(src?: string): boolean {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const img = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    img.current = new window.Image();
    if (img.current && src) {
      img.current.onload = () => {
        setIsLoaded(true);
      };
      img.current.src = src;
    }
  }, [src]);

  return isLoaded;
}

export default function Avatar({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  //const isLoaded = useImageOnLoad(src);

  const ref = useRef<HTMLImageElement>();

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

        if (ref.current) {
          observer.current.unobserve(ref.current);
        }
      }
    },
    [src]
  );

  const observer = useRef<IntersectionObserver>(
    new IntersectionObserver(callback)
  );

  const image = useCallback((node: HTMLImageElement) => {
    if (node) {
      observer.current.observe(node);
      ref.current = node;
    }
  }, []);

  return (
    <div
      className={cn(
        className,
        "z-20 w-12 h-12 flex-shrink-0 border-2 rounded-full transition-colors"
      )}
    >
      <img
        alt={alt}
        ref={image}
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

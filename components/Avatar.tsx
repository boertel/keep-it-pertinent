import cn from "classnames";
import { useEffect, useState, useRef } from "react";

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
  className,
}: {
  src?: string;
  className?: string;
}) {
  const isLoaded = useImageOnLoad(src);
  return (
    <div
      className={cn(
        className,
        "z-20 w-12 h-12 flex-shrink-0 border-2 rounded-full transition-colors"
      )}
    >
      <img
        src={src}
        className={cn(
          "rounded-full border-4 border-black transition-colors min-w-full min-h-full",
          {
            "bg-gray-700": !isLoaded,
          }
        )}
      />
    </div>
  );
}

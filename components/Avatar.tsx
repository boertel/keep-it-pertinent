import cn from "classnames";
import { useEffect, useState, useRef } from "react";

function useImageOnLoad(src: string | null): boolean {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const img = useRef<typeof Image | null>(null);

  useEffect(() => {
    img.current = new Image();
    if (img.current) {
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

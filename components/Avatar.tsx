import cn from "classnames";
import { useState } from "react";

function useOnLoad(objWithOnLoad) {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  objWithOnLoad.onload = () => {
    setIsLoaded(true);
  };

  return [objWithOnLoad, isLoaded];
}

export default function Avatar({
  src,
  className,
}: {
  src?: string;
  className?: string;
}) {
  const [image, isLoaded] = useOnLoad(new Image());
  if (!src) {
    return null;
  }
  image.src = src;
  return (
    <div
      className={cn(
        "z-20 w-12 h-12 flex-shrink-0 border-2 border-gray-400 rounded-full",
        className
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

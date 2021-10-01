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
    <div className={cn("w-12 h-12 flex-shrink-0 m-[2px]", className)}>
      <img
        src={src}
        className={cn(
          "rounded-full border-4 border-black outline-gray outline-on-hover transition-colors",
          { "bg-gray-700": !isLoaded }
        )}
        style={{
          minWidth: "48px",
          minHeight: "48px",
        }}
      />
    </div>
  );
}

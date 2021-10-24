import { ReactNode } from "react";
import cn from "classnames";

export default function Keyboard({
  children,
  className,
}: {
  className?: string | null;
  children: ReactNode;
}) {
  return (
    <kbd
      className={cn(
        "flex justify-center items-center text-xs font-thin transition-opacity py-1 px-2 border rounded-md border-gray-700 bg-black bg-opacity-80",
        className
      )}
    >
      {children}
    </kbd>
  );
}

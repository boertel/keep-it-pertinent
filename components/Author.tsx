import { ReactNode } from "react";
import cn from "classnames";

export default function Author({
  name,
  username,
  as: AsComponent = "h4",
  className,
  children,
  ...props
}: {
  name: string;
  username: string;
  as?: any;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <AsComponent className={cn("flex font-bold", className)}>
      {children}
      {name}&nbsp;
      <span className="text-sm font-normal text-gray-500">@{username}</span>
    </AsComponent>
  );
}

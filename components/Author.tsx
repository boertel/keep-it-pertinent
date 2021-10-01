import dayjs from "@/dayjs";
import cn from "classnames";

export default function Author({
  name,
  username,
  as: AsComponent = "h4",
  className,
  ...props
}: {
  name: string;
  username: string;
  as: any;
  className?: string;
}) {
  return (
    <AsComponent className={cn("flex font-bold", className)}>
      {name}&nbsp;
      <span className="text-sm font-normal text-gray-500">@{username}</span>
    </AsComponent>
  );
}

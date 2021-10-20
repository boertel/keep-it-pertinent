import dayjs, { calendar } from "@/dayjs";

export default function Datetime({
  children,
  className,
  as = "div",
  ...props
}: {
  children?: string;
  className?: string;
  as?: any;
}) {
  const AsComponent = as;
  if (!children) {
    return null;
  }

  return (
    <AsComponent
      className={className}
      title={dayjs(children).format("LLLL")}
      {...props}
    >
      {calendar(children)}
    </AsComponent>
  );
}

import dayjs from "@/dayjs";
import ms from "ms";

type DatetimeFormatValue = string | ((str: string) => string);

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
  let format: DatetimeFormatValue = "MMM DD, YYYY";
  const diff = dayjs().diff(children);
  for (const [key, value] of formats) {
    if (diff < key) {
      format = value;
      break;
    }
  }
  return (
    <AsComponent
      className={className}
      title={dayjs(children).format("LLLL")}
      {...props}
    >
      {getDatetime(children, format)}
    </AsComponent>
  );
}

function getDatetime(str: string, format: DatetimeFormatValue) {
  if (typeof format === "function") {
    return format(str);
  } else {
    return dayjs(str).format(format);
  }
}

const formats = new Map<number, DatetimeFormatValue>();

formats.set(ms("1d"), (str) => dayjs(str).fromNow());
formats.set(ms("130d"), "MMM DD");

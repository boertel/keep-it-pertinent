import dayjs from "@/dayjs";
import ms from "ms";

export default function Datetime({
  children,
  className,
}: {
  children?: string;
  className?: string;
}) {
  if (!children) {
    return null;
  }
  let format: string = "MMM DD, YYYY";
  const diff = dayjs().diff(children);
  for (const [key, value] of formats) {
    if (diff < key) {
      format = value;
      break;
    }
  }
  return (
    <div className={className} title={dayjs(children).format("LLLL")}>
      {getDatetime(children, format)}
    </div>
  );
}

function getDatetime(str, format) {
  if (typeof format === "function") {
    return format(str);
  } else {
    return dayjs(str).format(format);
  }
}

const formats = new Map();
formats.set(ms("1d"), (str) => dayjs(str).fromNow());
formats.set(ms("130d"), "MMM DD");

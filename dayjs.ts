// @ts-nocheck
import * as dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);

const calendarPlugin = (o, c, d) => {
  const LT = "h:mm A";
  const L = "MM/DD/YYYY";
  const calendarFormat = {
    lastDay: `[Yesterday at] ${LT}`,
    sameDay: `[Today at] ${LT}`,
    nextDay: `[Tomorrow at] ${LT}`,
    nextWeek: `[Next] dddd [at] ${LT}`,
    lastWeek: `dddd [at] ${LT}`,
    sameElse: L,
  };
  const proto = c.prototype;
  proto.calendar = function (referenceTime, formats) {
    const format = formats || this.$locale().calendar || calendarFormat;
    const referenceStartOfDay = d(referenceTime || undefined).startOf("d");
    const diff = this.diff(referenceStartOfDay, "d", true);
    const sameElse = "sameElse";
    /* eslint-disable no-nested-ternary */
    const retVal =
      diff < -6
        ? sameElse
        : diff < -1
        ? "lastWeek"
        : diff < 0
        ? "lastDay"
        : diff < 1
        ? "sameDay"
        : diff < 2
        ? "nextDay"
        : diff < 7
        ? "nextWeek"
        : diff < 720
        ? "lastYear"
        : sameElse;
    /* eslint-enable no-nested-ternary */
    const currentFormat = format[retVal] || calendarFormat[retVal];
    if (typeof currentFormat === "function") {
      return currentFormat.call(this, d());
    }
    return this.format(currentFormat);
  };
};

dayjs.extend(calendarPlugin);

export const calendar = (now) => {
  return dayjs(now).calendar(null, {
    sameDay: "h:mm A", // The same day ( Today at 2:30 AM )
    nextDay: "[Tomorrow at] h:mm A", // The next day ( Tomorrow at 2:30 AM )
    nextWeek: "dddd [at] h:mm A", // The next week ( Sunday at 2:30 AM )
    lastDay: "[Yesterday at] h:mm A", // The day before ( Yesterday at 2:30 AM )
    lastWeek: "dddd", // Last week ( Last Monday at 2:30 AM )
    lastYear: "[Last year]",
    sameElse: "MMM DD, YYYY", // Everything else ( 17/10/2011 )
  });
};

export default dayjs;

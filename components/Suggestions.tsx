// @ts-nocheck
import dayjs from "@/dayjs";
import cn from "classnames";

export default function Suggestions({
  tweets,
  className,
}: {
  tweets: any[];
  className?: string;
}) {
  let suggestions = [];
  const lastTweet = tweets[0];
  if (lastTweet && dayjs().diff(lastTweet.createdAt, "year") >= 1) {
    const diff = dayjs().diff(lastTweet.createdAt, "year");
    suggestions.push(
      <div
        key="a-year"
        className="border-2 border-red-400 p-4 rounded-md text-red-400"
      >
        No new tweets in the last {diff} {diff === 1 ? "year" : "years"}
      </div>
    );
  }
  const retweets = tweets.filter(({ isRetweet }) => isRetweet);
  const percentage = retweets.length / tweets.length;
  if (percentage > 0.8) {
    suggestions.push(
      <div
        key="too-much-retweets"
        className="border-2 rounded-md border-yellow-400 p-4 text-yellow-400"
      >
        {Math.floor(percentage * 100)}% of retweets
      </div>
    );
  }
  let previous: any;
  let diffs: number[] = [];
  tweets.forEach((tweet, index: number) => {
    if (previous) {
      diffs.push(dayjs(previous.createdAt).diff(tweet.createdAt, "seconds"));
    }
    previous = tweet;
  });
  const frequency =
    diffs.length > 1 ? diffs.reduce((a, b) => a + b) / diffs.length : Infinity;

  if (frequency <= 15 * 60 * 60) {
    suggestions.push(
      <div
        key="too-frequent"
        className="border-2 rounded-md border-yellow-400 p-4 text-yellow-400"
      >
        One tweet every{" "}
        {formatDuration(frequency, { intervals: ["day", "hour", "minute"] })} on
        average
      </div>
    );
  }

  return suggestions.length > 0 ? (
    <div className={cn("my-4 space-y-2", className)}>{suggestions}</div>
  ) : null;
}

export function duration(seconds: number): number[] {
  let output: number[] = [];
  let remainder: number = seconds;
  const durations: number[] = [
    // Number of seconds in
    24 * 60 * 60, // a day
    60 * 60, // a hour
    1 * 60, // a minute
  ];
  durations.forEach((divisor: number, index: number) => {
    const quotient: number = Math.abs(parseInt(`${remainder / divisor}`, 10));
    remainder = Math.abs(remainder % divisor);
    output.push(Math.floor(quotient));
    if (index === durations.length - 1) {
      output.push(Math.floor(remainder));
    }
  });
  return output.reverse();
}

function pad(value: number): string {
  let s = String(value);
  while (s.length < 2) {
    s = "0" + s;
  }
  return s;
}

const defaultFormat = (value: number, key: string): string =>
  `${value} ${value === 1 ? key : `${key}s`}`;

const defaultSeparator = (index: number, length: number): string => {
  if (index === 0) {
    return "";
  }
  if (index === length - 1) {
    return " and ";
  } else {
    return ", ";
  }
};

interface DurationOptions {
  ignoreZero?: boolean;
  format?: any;
  separator?: any;
  intervals?: string[];
}
export function formatDuration(seconds: number, options: DurationOptions = {}) {
  options = {
    ignoreZero: true,
    format: defaultFormat,
    separator: defaultSeparator,
    intervals: ["day", "hour", "minute", "second"],
    ...options,
  };

  const { format, ignoreZero, separator, intervals } = options;

  const parts = duration(seconds).reverse();

  const output = parts
    .map((part, index: number) => {
      const interval = intervals[index];
      return interval ? format(part, interval) : null;
    })
    .filter((part, index) => {
      if (part === null) {
        return false;
      }
      if (ignoreZero) {
        return parts[index] !== 0;
      }
      return true;
    });

  return output
    .reduce(
      (previous, current, index) =>
        `${previous}${separator(index, output.length)}${current}`,
      ""
    )
    .trim();
}

export function formatDurationShort(seconds, options = {}) {
  options = {
    intervals: ["d", "h", "m", "s"],
    format: (value, key) =>
      `${["d", "h"].includes(key) ? value : pad(value)}${key}`,
    separator: () => " ",
    ...options,
  };
  return formatDuration(seconds, options);
}

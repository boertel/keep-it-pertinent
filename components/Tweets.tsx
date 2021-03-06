// @ts-nocheck
import React, { useEffect } from "react";
import cn from "classnames";
import Tweet from "./Tweet";
import Link from "next/link";
import { useJKNavigation } from "@/hooks";

export default function Tweets({
  tweets,
  className,
}: {
  tweets?: any[];
  className?: string;
}) {
  const [navIndex, setNavIndex, focus] = useJKNavigation(tweets?.length);

  useEffect(() => {
    setNavIndex(-1);
  }, [tweets, setNavIndex]);

  return (
    <div className={cn("max-w-prose mx-auto w-full", className)}>
      <ul className="mb-20 min-h-screen">
        {tweets?.map((tweet: any, index: number) => (
          <Link
            href={`https://twitter.com/${tweet.author.username}/status/${tweet.id}`}
            key={tweet.id}
          >
            <a
              ref={index === navIndex ? focus : null}
              target="_blank"
              rel="noopener noreferer"
              className={cn(
                "flex no-underline outline-none ring-offset-4 ring-offset-black border-b border-gray-700",
                "hover:ring hover:ring-blue-600 hover:border-transparent hover:rounded-md focus:ring focus:ring-blue-600 focus:border-transparent focus:rounded-md mx-2 md:,x-none"
              )}
            >
              <Tweet className={cn("w-full px-4 sm:px-0")} {...tweet} />
            </a>
          </Link>
        ))}
      </ul>
    </div>
  );
}

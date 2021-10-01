import useSWR from "swr";
import cn from "classnames";
import { NextSeo } from "next-seo";

import Link from "next/link";
import { Author, Avatar } from "@/components";
import { useState, useEffect, useCallback } from "react";

import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useRegisterShortcut } from "@/hooks/useShortcut";

export default function Home() {
  const { data } = useSWR("/api/twitter/followers");

  const { restore } = useScrollRestoration();
  useEffect(restore, [restore]);

  const check = useJKNavigation((node: HTMLAnchorElement) => {
    if (node) {
      node.focus();
    }
  });

  return (
    <div className="max-w-prose mx-auto w-full">
      <NextSeo title="Expiration" />
      <h1 className="text-[4.8rem] leading-none font-black mt-6 mb-16">
        Expiration
      </h1>
      <ul className="space-y-2">
        {data?.data.map(({ id, name, username, profile_image_url }, index) => (
          <li key={id}>
            <Link href={`/u/${username}`}>
              <a
                ref={check(index)}
                className={cn(
                  "flex p-2 items-center space-x-4 no-underline outline-color-gray ring-offset-4 ring-offset-black rounded-md"
                )}
              >
                <Avatar src={profile_image_url} />
                <Author
                  username={username}
                  name={name}
                  avatar={profile_image_url}
                  className="flex-col items-start justify-start"
                />
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function useJKNavigation(callback: any) {
  const [navIndex, setNavIndex] = useState<number>(-1);

  useRegisterShortcut(
    "j",
    () => {
      setNavIndex((prev) => prev + 1);
    },
    [setNavIndex]
  );

  useRegisterShortcut(
    "k",
    () => {
      setNavIndex((prev) => prev - 1);
    },
    [setNavIndex]
  );

  const check = useCallback(
    (index: number) => {
      if (navIndex === index) {
        return callback;
      }
      return null;
    },
    [navIndex]
  );

  return check;
}

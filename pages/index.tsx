import cn from "classnames";
import { NextSeo } from "next-seo";

import Link from "next/link";
import { Author, Avatar } from "@/components";
import { useState, useEffect, useCallback } from "react";

import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useRegisterShortcut } from "@/hooks/useShortcut";

import { useFollowers } from "../components/Followers";

export default function Home() {
  const { followers } = useFollowers();
  const { restore } = useScrollRestoration();
  useEffect(restore, [restore]);

  const check = useJKNavigation((node: HTMLAnchorElement) => {
    if (node) {
      console.log(node);
      node.focus();
    }
  }, followers?.data.length);

  return (
    <div className="max-w-prose mx-auto w-full">
      <NextSeo title="Expiration" />
      <h1 className="text-[4.8rem] leading-none font-black mt-6 mb-16">
        Expiration
      </h1>
      <ul className="space-y-2">
        {followers?.data.map(
          ({ id, name, username, profile_image_url }, index) => (
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
          )
        )}
      </ul>
    </div>
  );
}

function useJKNavigation(callback: any, max?: number) {
  const [navIndex, setNavIndex] = useState<number>(-1);

  useRegisterShortcut(
    "j",
    () => {
      setNavIndex((prev) => {
        if (max) {
          return prev >= max - 1 ? prev : prev + 1;
        } else {
          return prev + 1;
        }
      });
    },
    [setNavIndex, max]
  );

  useRegisterShortcut(
    "k",
    () => {
      setNavIndex((prev) => {
        return prev <= 0 ? 0 : prev - 1;
      });
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

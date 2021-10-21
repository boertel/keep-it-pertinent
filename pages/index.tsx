// @ts-nocheck
import cn from "classnames";
import { NextSeo } from "next-seo";

import Link from "next/link";
import { Title, Author, Avatar } from "@/components";
import { useRef, useLayoutEffect, useCallback } from "react";

import { useOnLeave, useOnEnter } from "@/hooks/useScrollRestoration";
import { useJKNavigation } from "@/hooks";

import { useFollowers } from "../components/Followers";

interface ScrollRestoration {
  scrollY: number;
  navIndex: number;
}

export default function Home() {
  const { followers } = useFollowers();
  const [navIndex, setNavIndex] = useJKNavigation();

  const onLeave = useCallback(() => {
    return {
      scrollY: window.scrollY,
      navIndex,
    };
  }, [navIndex]);

  const onEnter = useCallback(
    ({ scrollY, navIndex }: ScrollRestoration) => {
      window.scrollTo(0, scrollY);
      if (navIndex !== undefined) {
        setNavIndex(navIndex);
      }
    },
    [setNavIndex]
  );

  useOnEnter<ScrollRestoration>(onEnter);
  useOnLeave<ScrollRestoration>(onLeave);

  const ref = useRef<HTMLAnchorElement | null>(null);

  const focus = useCallback((node: HTMLAnchorElement) => {
    if (node) {
      node.focus();
      ref.current = node;
    }
  }, []);

  return (
    <div className="max-w-prose mx-auto w-full">
      <NextSeo title="Keep it pertinent" />
      <Title />
      <ul className="space-y-2 relative">
        <Highlight follow={ref.current} />
        {followers?.data.map(({ id, name, username, avatar }, index) => (
          <li key={id}>
            <Link href={`/u/${username}`}>
              <a
                ref={navIndex === index ? focus : null}
                className={cn(
                  "flex p-2 items-center space-x-4 no-underline rounded-md outline-none"
                )}
              >
                <Avatar
                  src={avatar}
                  className={cn(
                    "focus:border-blue-600 hover:border-blue-600",
                    navIndex === index ? "border-blue-600" : "border-gray-400"
                  )}
                />
                <Author
                  username={username}
                  name={name}
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

function Highlight({ follow }: { follow: HTMLAnchorElement | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const lastAt = useRef<number>(0);

  const ms = 150;
  let transitions = ["opacity .2s ease-in-out", `top ${ms}ms ease-in-out`];

  useLayoutEffect(() => {
    if (follow) {
      const { height } = window.getComputedStyle(follow);
      if (ref.current) {
        ref.current.style.opacity = "100%";
        ref.current.style.height = height;
        let slice = 2;
        if (new Date().getTime() - lastAt.current < ms) {
          slice = 1;
        }
        ref.current.style.transition = transitions.slice(0, slice).join(", ");
        ref.current.style.top = `${follow.offsetTop}px`;
        lastAt.current = new Date().getTime();
      }
    }
  }, [follow]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-10 w-full border-2 border-blue-600 rounded-md opacity-0 pointer-events-none"
      )}
    />
  );
}

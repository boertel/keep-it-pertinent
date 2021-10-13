import cn from "classnames";
import { NextSeo } from "next-seo";
import debounce from "lodash/debounce";

import Link from "next/link";
import { Author, Avatar } from "@/components";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";

import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useRegisterShortcut } from "@/hooks/useShortcut";

import { useFollowers } from "../components/Followers";

export default function Home() {
  const { followers } = useFollowers();
  const { restore } = useScrollRestoration();
  const navIndex = useJKNavigation();

  const onLeave = useCallback(() => {
    return {
      navIndex,
    };
  }, [navIndex]);

  useEffect(() => {
    restore(onLeave);
  }, [restore, onLeave]);
  const ref = useRef<HTMLAnchorElement | null>(null);

  const focus = useCallback((node: HTMLAnchorElement) => {
    if (node) {
      node.focus();
      ref.current = node;
    }
  }, []);

  return (
    <div className="max-w-prose mx-auto w-full">
      <NextSeo title="Expiration" />
      <h1 className="text-[4.8rem] leading-none font-black mt-6 mb-16">
        Expiration
      </h1>
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
                <Avatar src={avatar} />
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

  const ms = 300;
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

function useJKNavigation(max?: number) {
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

  return navIndex;
}

// @ts-nocheck
import cn from "classnames";
import { NextSeo } from "next-seo";

import Link from "next/link";
import { Title, Author, Avatar } from "@/components";
import { useRef, useCallback, forwardRef, useEffect } from "react";

import { useOnLeave, useOnEnter } from "@/hooks/useScrollRestoration";
import { useJKNavigation, useHighlight } from "@/hooks";

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
        // @ts-ignore
        setNavIndex(navIndex);
      }
    },
    [setNavIndex]
  );

  useOnEnter<ScrollRestoration>(onEnter);
  // @ts-ignore
  useOnLeave<ScrollRestoration>(onLeave);

  const {
    wrapperRef,
    highlightRef,
    styles: highlightStyles,
    reposition,
    reset,
  } = useHighlight();

  return (
    <div className="max-w-prose mx-auto w-full">
      <NextSeo title="Keep it pertinent" />
      <Title />
      <ul className="space-y-2 relative" ref={wrapperRef} onMouseLeave={reset}>
        <div
          className="absolute z-10 w-full border-2 border-blue-600 rounded-md opacity-0 pointer-events-none"
          ref={highlightRef}
          style={highlightStyles}
        />
        {/* @ts-ignore */}
        {followers?.data.map(({ id, name, username, avatar }, index) => (
          <li key={id}>
            <Link href={`/u/${username}`} passHref>
              <Follower
                id={id}
                name={name}
                username={username}
                avatar={avatar}
                index={index}
                navIndex={navIndex}
                reposition={reposition}
                setNavIndex={setNavIndex}
              />
            </Link>
          </li>
        ))}
      </ul>
      <div className="p-10 text-center italic text-gray-500">
        Sorry, we are working on showing more than your last 200 followers!
      </div>
    </div>
  );
}

function Follower({
  id,
  avatar,
  username,
  name,
  index,
  navIndex,
  reposition,
  setNavIndex,
  href,
}) {
  let ref = useRef();

  useEffect(() => {
    if (navIndex === index) {
      reposition(ref, id);
      if (ref.current) {
        ref.current.focus();
      }
    }
  }, [navIndex, index, reposition, id]);

  return (
    <a
      href={href}
      ref={ref}
      onMouseEnter={() => setNavIndex(index)}
      className={cn(
        "flex p-2 items-center space-x-4 no-underline rounded-md outline-none group cursor-pointer"
      )}
    >
      <Avatar
        src={avatar}
        alt={`${username} avatar`}
        className={cn(
          "focus:border-blue-600 group-hover:border-blue-600 duration-150 transition-colors",
          navIndex === index ? "border-blue-600" : "border-gray-400"
        )}
      />
      <Author
        username={username}
        name={name}
        className="flex-col items-start justify-start"
      />
    </a>
  );
}

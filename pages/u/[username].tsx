import { useRouter } from "next/router";
import cn from "classnames";
import { NextSeo } from "next-seo";
import useSWR from "swr";

import { useRegisterShortcut } from "@/hooks/useShortcut";
import { Bio, Footer, Tweet, Suggestions } from "@/components";
import { useState, useEffect, useRef } from "react";
import { useFollowers } from "../../components/Followers";

const NUMBER_OF_TWEETS = 20;

export default function Username() {
  const router = useRouter();
  const { query } = router;

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const current = useRef<HTMLElement>();

  useRegisterShortcut(
    "Escape",
    () => {
      router.push("/");
    },
    [router, query]
  );

  useRegisterShortcut("j", () => {
    setCurrentIndex((prev) => {
      return prev < NUMBER_OF_TWEETS - 1 ? prev + 1 : prev;
    });
  });
  useRegisterShortcut("k", () => {
    setCurrentIndex((prev) => {
      return prev > 0 ? prev - 1 : prev;
    });
  });

  useEffect(() => {
    if (current.current) {
      current.current.scrollIntoView();
    }
  }, [currentIndex]);

  const { data: user } = useSWR(
    query.username && `/api/twitter/users/${query.username}`
  );

  const { data: tweets } = useSWR(
    user?.data.id && `/api/twitter/tweets/${query.username}`
  );

  const { next, previous } = useFollowers(router.query?.username);
  useSWR(next?.username && `/api/twitter/tweets/${next?.username}`);
  useSWR(previous?.username && `/api/twitter/tweets/${previous?.username}`);

  return (
    <>
      <div className="max-w-prose mx-auto w-full">
        {user && (
          <>
            <NextSeo
              title={`${user.data.name} (${user.data.username}) | expiration`}
            />
            <Bio
              name={user.data.name}
              username={user.data.username}
              description={user.data.description}
              avatar={user.data.avatar}
              urls={user.data.urls}
              className="px-4 sm:px-0"
            />
          </>
        )}
        {tweets?.data && (
          <Suggestions className="mt-10 mx-4 sm:mx-0" tweets={tweets.data} />
        )}
        <ul className="mt-10 mb-20 min-h-screen border-t border-gray-700">
          {tweets?.data.slice(0, NUMBER_OF_TWEETS).map(
            (
              {
                id,
                text,
                createdAt,
                author,
                retweet,
                media,
              }: {
                id: number;
                text: string;
                createdAt: string;
                author: any;
                retweet: any;
                media: any;
              },
              index: number
            ) => {
              return (
                <Tweet
                  ref={index === currentIndex ? current : null}
                  key={id}
                  text={text}
                  author={author}
                  createdAt={createdAt}
                  retweet={retweet}
                  media={media}
                  className={cn(
                    "px-4 sm:px-0 ring-offset-4 ring-offset-black border-b border-gray-700",
                    {
                      "ring border-transparent rounded-md":
                        index === currentIndex,
                    }
                  )}
                />
              );
            }
          )}
        </ul>
        {user?.data?.public_metrics && (
          <div className="text-center mb-12">
            <em>and {user.data.public_metrics.tweet_count} more tweets… </em>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

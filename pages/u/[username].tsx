import { useRouter } from "next/router";
import cn from "classnames";
import { NextSeo } from "next-seo";
import useSWR from "swr";

import { useRegisterShortcut } from "@/hooks/useShortcut";
import { Bio, Footer, Tweet, Suggestions } from "@/components";
import { useState, useEffect, useRef } from "react";

const NUMBER_OF_TWEETS = 10;

export default function Username() {
  const router = useRouter();
  const { query } = router;

  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const current = useRef<HTMLElement>();

  useRegisterShortcut("Escape", () => router.push("/"), [router]);

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

  const { data } = useSWR(
    user?.data.id && `/api/twitter/tweets/${user?.data.id}`
  );

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
              avatar={user.data.profile_image_url}
              entities={user.data.entities}
              className="px-4 sm:px-0"
            />
          </>
        )}
        {data?.data && (
          <Suggestions className="mt-10 mx-4 sm:mx-0" tweets={data.data} />
        )}
        <ul className="mt-10 mb-20 min-h-screen border-t border-gray-700">
          {data?.data.slice(0, NUMBER_OF_TWEETS).map(
            (
              {
                id,
                text,
                created_at,
                referenced_tweets,
                attachments,
                entities,
              }: {
                id: number;
                text: string;
                created_at: string;
                referenced_tweets: any;
                attachments: any;
                entities: any;
              },
              index: number
            ) => {
              const author = {
                name: user.data.name,
                username: user.data.username,
                avatar: user.data.profile_image_url,
              };
              return (
                <Tweet
                  ref={index === currentIndex ? current : null}
                  key={id}
                  text={text}
                  author={author}
                  createdAt={created_at}
                  referencedTweets={referenced_tweets}
                  includes={data.includes}
                  attachments={attachments}
                  entities={entities}
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

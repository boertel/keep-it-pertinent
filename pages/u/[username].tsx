// @ts-nocheck
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import useSWR from "swr";

import { Bio, Footer, Tweets, Suggestions } from "@/components";
import { useEffect } from "react";
import { useFollowers } from "../../components/Followers";

export default function Username() {
  const router = useRouter();
  const { query } = router;

  const { data: user } = useSWR(
    query.username && `/api/twitter/users/${query.username}`
  );

  const { data: tweets, isValidating } = useSWR(
    user?.data.id && `/api/twitter/tweets/${query.username}`
  );

  const { next, previous } = useFollowers(router.query?.username);
  useSWR(!!tweets && next?.username && `/api/twitter/tweets/${next?.username}`);
  useSWR(
    !!tweets &&
      previous?.username &&
      `/api/twitter/tweets/${previous?.username}`
  );

  useEffect(() => {
    if (next?.avatar) {
      const img = new Image();
      img.src = next.avatar;
    }
  }, [next]);

  useEffect(() => {
    if (previous?.avatar) {
      const img = new Image();
      img.src = previous.avatar;
    }
  }, [previous]);

  return (
    <>
      <div className="max-w-prose mx-auto w-full">
        {user && (
          <>
            <NextSeo
              title={`${user.data.name} (${user.data.username}) | Keep it pertinent`}
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
          <div className="mt-10 border-b border-gray-700">
            <Suggestions className="mt-10 mx-4 sm:mx-0" tweets={tweets.data} />
          </div>
        )}
        <Tweets tweets={tweets?.data} />
        {user?.data?.public_metrics && (
          <div className="text-center mb-12">
            <em>and {user.data.public_metrics.tweet_count} more tweets… </em>
          </div>
        )}
      </div>
      <Footer userId={user?.data.id} />
    </>
  );
}

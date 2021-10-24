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

  const { data: user = {} } = useSWR(
    query.username && `/api/twitter/users/${query.username}`
  );

  const { data: tweets } = useSWR(
    query.username && `/api/twitter/tweets/${query.username}`
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
        <>
          {!!user && (
            <NextSeo
              title={`${user.name} (${user.username}) | Keep it pertinent`}
            />
          )}
          <Bio
            name={user.name}
            username={user.username}
            description={user.description}
            avatar={user.avatar}
            urls={user.urls}
            className="px-4 sm:px-0"
          />
        </>
        {tweets?.data && (
          <div className="mt-10 border-b border-gray-700">
            <Suggestions className="mt-10 mx-4 sm:mx-0" tweets={tweets.data} />
          </div>
        )}
        <Tweets tweets={tweets?.data} />
        {!!user && (
          <div className="text-center mb-12">
            <em>and {user?.tweetsCount} more tweets… </em>
          </div>
        )}
      </div>
      <Footer userId={user?.id} />
    </>
  );
}

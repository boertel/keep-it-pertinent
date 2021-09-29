import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import useSWR from "swr";
import Link from "next/link";

import { Tweet } from "@/components";

export default function Username() {
  const { query } = useRouter();

  const { data: user, isValidating: isValidatingUser } = useSWR(
    query.username && `/api/twitter/users/${query.username}`
  );
  let website;
  if (user?.data) {
    website = user.data?.entities?.url?.urls[0];
  }

  const { data, isValidating } = useSWR(
    query.username && `/api/twitter/tweets/${query.username}`
  );

  console.log(data);
  const users = {};

  return isValidating || isValidatingUser ? null : (
    <>
      {user && (
        <>
          <NextSeo
            title={`${user.data.name} (${user.data.username}) | expiration`}
          />
          <details>
            <summary className="w-full flex items-center justify-between space-x-2 mt-10">
              <div className="flex items-center space-x-2">
                <img
                  src={user.data.profile_image_url}
                  className="rounded-full w-12 h-12 border-4 border-black"
                  style={{ outline: "2px solid white" }}
                />
                <div className="flex flex-col">
                  <h1 className="text-xxl font-bold">{user.data.name}</h1>
                  <Link href={`https://twitter.com/${user.data.username}`}>
                    <a
                      className="text-gray-500"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <h3>@{user.data.username}</h3>
                    </a>
                  </Link>
                </div>
              </div>
              <div className="flex items-center">
                <Link href={website.expanded_url}>
                  <a
                    className="text-blue-500"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {website.display_url}
                  </a>
                </Link>
              </div>
            </summary>
            <div className="mt-4 text-sm italic">{user.data.description}</div>
          </details>
        </>
      )}
      <ul className="mt-10 mb-20 divide-y divide-gray-700 divide-solid">
        {data?.data
          .slice(0, 10)
          .map(
            ({
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
            }) => {
              const author = {
                name: user.data.name,
                username: user.data.username,
              };
              return (
                <Tweet
                  key={id}
                  text={text}
                  createdAt={created_at}
                  referencedTweets={referenced_tweets}
                  includes={data.includes}
                  attachments={attachments}
                  entities={entities}
                />
              );
            }
          )}
      </ul>
      <footer className="border-t border-gray-700 flex items-center justify-center space-x-3 sticky bottom-0 bg-black pt-4 pb-6">
        <button className="border-2 border-red-400 px-6 py-2 rounded-md min-w-4">
          Un-follow
        </button>
        <button className="border-2 border-green-400 px-6 py-2 rounded-md">
          Next
        </button>
      </footer>
    </>
  );
}

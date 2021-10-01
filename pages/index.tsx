import useSWR from "swr";
import { NextSeo } from "next-seo";

import Link from "next/link";
import { Author, Avatar } from "@/components";

export default function Home() {
  const { data, isValidating } = useSWR("/api/twitter/followers");
  return isValidating ? null : (
    <div className="max-w-prose mx-auto w-full">
      <NextSeo title="Expiration" />
      <h1 className="text-[4.8rem] leading-none font-black mt-6 mb-16">
        Expiration
      </h1>
      <ul className="space-y-6">
        {data?.data.map(({ id, name, username, profile_image_url }) => (
          <li key={id}>
            <Link href={`/u/${username}`}>
              <a className="flex items-center space-x-4 no-underline outline-color-gray hover:outline-color-blue">
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

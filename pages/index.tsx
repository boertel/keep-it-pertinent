import useSWR from "swr";
import Link from "next/link";

async function fetcher(url) {
  const response = await fetch(url);
  return await response.json();
}

export default function Home() {
  const { data, isValidating } = useSWR("/api/twitter/followers", fetcher, {
    revalidateOnFocus: false,
  });
  return isValidating ? null : (
    <ul className="space-y-6">
      {data?.data.map(({ id, name, username, profile_image_url }) => (
        <li key={id}>
          <Link href={`/u/${id}`}>
            <a className="flex items-center space-x-2">
              <img src={profile_image_url} className="rounded-full w-12 h-12" />
              <div>{name}</div>
            </a>
          </Link>
        </li>
      ))}
    </ul>
  );
}

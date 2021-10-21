import useSWR from "swr";
import { Tweets } from "@/components";

export default function Home() {
  const { data: tweets = [] } = useSWR("/api/twitter/timeline");

  return <Tweets tweets={tweets} />;
}

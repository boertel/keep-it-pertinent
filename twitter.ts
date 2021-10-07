import axios from "axios";
import { TWITTER_BEARER_TOKEN } from "@/config";
import { cache } from "@/cache";

const twitter = axios.create({
  baseURL: "https://api.twitter.com",
  headers: {
    Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
  },
});

const twitter_get = twitter.get;

twitter.get = cache(`twitter:get`, {
  expiration: 30 * 60,
})(async function (...args) {
  const { data } = await twitter_get.apply(twitter, args);
  return { data };
});

export default twitter;

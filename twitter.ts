import axios from "axios";
import { TWITTER_BEARER_TOKEN } from "@/config";
import { cache } from "@/cache";

const twitter = axios.create({
  baseURL: "https://api.twitter.com/2/",
  headers: {
    Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
  },
});

const twitterWithCache = function (...args) {};

const methods = ["get", "post", "put", "delete", "patch"].map((method) => {
  twitterWithCache[method] = cache(`twitter:${method}`, {
    expiration: 30 * 60,
  })(async function (...args) {
    const { data } = await twitter[method].apply(twitter, args);
    return { data };
  });
});

export default twitterWithCache;

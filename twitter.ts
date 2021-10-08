import OtherTwitter from "twitter";
import pick from "lodash.pick";
import get from "lodash.get";
import pickBy from "lodash.pickBy";
import mapValues from "lodash.mapValues";
import dayjs from "@/dayjs";
import { cache } from "@/cache";
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from "@/config";

export default class Twitter {
  constructor({
    oauth_token,
    oauth_token_secret,
  }: {
    oauth_token: string;
    oauth_token_secret: string;
  }) {
    this.client = new OtherTwitter({
      consumer_key: TWITTER_CLIENT_ID,
      consumer_secret: TWITTER_CLIENT_SECRET,
      access_token_key: oauth_token,
      access_token_secret: oauth_token_secret,
    });

    const methods = ["get", "post", "stream"];
    methods.forEach((method) => {
      this.client[method] = promisify(this.client[method].bind(this.client));
    });
  }

  get(...args) {
    return cache("twitter:get", { expiration: 60 * 120 })(this.client.get)(
      ...args
    );
  }

  post(...args) {
    return promisify(this.client.post);
  }

  stream(...args) {
    return promisify(this.client.stream);
  }

  async getUserByUsername(username?: string) {
    let params = undefined;
    if (username) {
      params = {
        screen_name: username,
      };
    }
    const { data } = await this.get("users/lookup", params);
    const user = data[0];
    return parseUser(user);
  }

  async getFollowedUsers() {
    const params = {
      cursor: -1,
      count: 200,
      skip_status: true,
      include_user_entities: true,
    };
    const { data } = await this.get("friends/list", params);
    // FIXME pagination is NOT handled
    // here are the attributes for data [ 'users', 'next_cursor', 'next_cursor_str', 'previous_cursor', 'previous_cursor_str', 'total_count' ]
    return data.users.map(parseUser);
  }

  async getTweetsByUsername(username: string) {
    const params = {
      screen_name: username,
      count: 100,
      exclude_replies: true,
      include_rts: true,
      include_entities: true,
    };
    const { data } = await this.get("statuses/user_timeline", params);
    return data.map((t) => parseTweet(t));
  }
}

function parseTweet(tweet, overwrite = {}) {
  if (tweet.retweeted_status) {
    return parseTweet(tweet.retweeted_status, { isRetweet: true });
  }
  let output = {
    id: tweet.id_str,
    createdAt: dayjs.utc(tweet.created_at).format(),
    text: tweet.text,
    author: parseUser(tweet.user),
    isRetweet:
      tweet.is_quote_status ||
      !!tweet.quoted_status ||
      !!tweet.has_retweeted_status,
    ...overwrite,
  };
  if (!!tweet.quoted_status) {
    output.retweet = parseTweet(tweet.quoted_status);
  }
  if (tweet.entities?.media) {
    output.media = tweet.entities.media.map((m) => ({
      id: m.id_str,
      url: m.media_url_https,
    }));
  }
  return output;
}

function parseUser(user) {
  return {
    avatar: user.profile_image_url_https,
    name: user.name,
    id: user.id_str,
    location: user.location,
    username: user.screen_name,
    createdAt: dayjs.utc(user.created_at).format(),
    tweetsCount: user.statuses_count,
    description: user.description,
    urls: user?.entities?.url?.urls.map(({ display_url, expanded_url }) => ({
      displayUrl: display_url,
      expandedUrl: expanded_url,
    })),
  };
}

function promisify(func) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      function callback(error, data, response) {
        if (error) {
          reject(error);
        } else {
          console.log(limits(response.headers));
          resolve({ data, response });
        }
      }
      const parameters = [...args, callback];
      func.apply(func, parameters);
    });
  };
}

function limits(headers) {
  try {
    const formats = {
      "x-rate-limit-limit": (v) => v,
      "x-rate-limit-reset": (v) => dayjs(parseInt(v, 10) * 1000).format(),
      "x-rate-limit-remaining": (v) => v,
    };
    let output = [];
    for (const key in formats) {
      const format = formats[key];
      output.push(`${key}=${format(headers[key])}`);
    }
    return output.join(", ");
  } catch (exception) {
    console.warn("failed to get rate limits header");
    return "";
  }
}

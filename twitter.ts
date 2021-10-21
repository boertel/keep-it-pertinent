// @ts-nocheck
import tweets from "twitter-text";
import OtherTwitter from "twitter";
import db from "@/db";
import Cookies from "cookies";
import redis from "@/redis";
import dayjs from "@/dayjs";
import { cache } from "@/cache";
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from "@/config";

export default class Twitter {
  userId: string;
  client: any;

  constructor({
    oauth_token,
    oauth_token_secret,
    userId,
  }: {
    oauth_token: string;
    oauth_token_secret: string;
    userId: string;
  }) {
    this.client = new OtherTwitter({
      consumer_key: TWITTER_CLIENT_ID,
      consumer_secret: TWITTER_CLIENT_SECRET,
      access_token_key: oauth_token,
      access_token_secret: oauth_token_secret,
    });

    this.userId = userId;

    const methods = ["get", "post", "stream"];
    methods.forEach((method) => {
      this.client[method] = promisify(this.client[method].bind(this.client));
    });
  }

  getByUser(...args) {
    if (!this.userId) {
      throw Error("userId must be defined in order to cache this API call");
    }
    return this._get(this.userId, ...args);
  }

  get(...args) {
    return this._get(null, ...args);
  }

  _get(cacheKey: string | null, ...args) {
    let key = ["twitter", "get"];
    if (cacheKey) {
      key.push(cacheKey);
    }
    // TODO hack! we should be able to define this when calling `get` / `getByUser`
    let params = undefined;
    if (["/friends/list", "/lists/list"].includes(args[0])) {
      params = () => args[0];
    } else if (args[0] === "/lists/members") {
      params = () => `${args[0]}?list_id=${args[1].list_id}`;
    }
    return cache(key.join(":"), { expiration: 60 * 120, params })(
      this.client.get
    )(...args);
  }

  post(...args) {
    return promisify(this.client.post)(...args);
  }

  stream(...args) {
    return promisify(this.client.stream);
  }

  async getTimeline() {
    const params = {
      exclude_replies: true,
      include_entities: true,
    };
    const { data } = await this.getByUser("/statuses/home_timeline", params);
    return data.map(parseTweet);
  }

  async getLists() {
    const { data } = await this.getByUser("/lists/list");
    return data.map(parseList);
  }

  async getListMembers(listId: string) {
    const { data } = await this.getByUser("/lists/members", {
      include_entities: false,
      skip_status: true,
      list_id: listId,
    });
    const members: { [key: string]: boolean } = {};
    data.users.forEach(({ screen_name }) => {
      members[screen_name] = true;
    });
    return members;
  }

  async getOrCreateList(name: string, mode?: string) {
    const lists = await this.getLists();
    const existingList = lists.find((list) => list.name === name);
    if (existingList) {
      return existingList;
    } else {
      const body = {
        name,
        mode: mode || "private",
      };
      const { data: created } = await this.post("/lists/create", body);
      await redis.del(`twitter:get:${this.userId}:/lists/list`);
      return parseList(created);
    }
  }

  async removeFromList(listId: string, username: string) {
    const body = {
      list_id: listId,
      screen_name: username,
    };
    const { data } = await this.post(`/lists/members/destroy`, body);
    await redis.del(
      `twitter:get:${this.userId}:/lists/members?list_id=${listId}`
    );
    return data;
  }

  async addToList(listId: string, username: string) {
    const body = {
      list_id: listId,
      screen_name: username,
    };
    const { data } = await this.post(`/lists/members/create`, body);
    return data;
  }

  async unfollow(username: string) {
    const body = {
      screen_name: username,
    };

    // TODO would be nicer to have something cleaner
    const { data } = await this.post("/friendships/destroy", body);
    const key = `twitter:get:${this.userId}:/friends/list`;
    const cached = await redis.get(key);
    if (cached) {
      try {
        const expiration = parseInt(await redis.ttl(key), 10);
        const json = JSON.parse(cached);
        const withoutUsername = {
          ...json,
          data: {
            ...json.data,
            users: json.data.users.filter(
              ({ screen_name }) => screen_name !== username
            ),
          },
        };
        await redis.setex(key, expiration, JSON.stringify(withoutUsername));
      } catch (exception) {
        console.error(exception);
      }
    }

    return data;
  }

  async getUserByUsername(username?: string) {
    let params = undefined;
    if (username) {
      params = {
        screen_name: username,
      };
    }
    const { data } = await this.get("/users/lookup", params);
    const user = data[0];
    return parseUser(user);
  }

  async getFollowedUsers({ cursor = -1 }: { cursor?: number }) {
    const params = {
      cursor,
      count: 200,
      skip_status: true,
      include_user_entities: true,
    };
    const { data } = await this.getByUser("/friends/list", params);
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
    const { data } = await this.get("/statuses/user_timeline", params);
    return data.map((t) => parseTweet(t));
  }
}

export class HttpError extends Error {
  statusCode: number;
  message: string;
}
class UnauthorizedError extends HttpError {
  statusCode: number = 401;
  message: string = "Unauthorized";
}

export async function createTwitterFromReq(req) {
  const cookies = new Cookies(req);
  const sessionToken =
    cookies.get("next-auth.session-token") ||
    cookies.get("__Secure-next-auth.session-token");
  if (!sessionToken) {
    throw new UnauthorizedError();
  }
  // FIXME `some` is dangerous since it will return other users
  const user = await db.user.findFirst({
    where: {
      sessions: { some: { sessionToken } },
    },
    include: {
      accounts: true,
    },
  });

  const twitterAccount = user.accounts.find(
    ({ provider }) => provider === "twitter"
  );
  if (!twitterAccount) {
    throw new UnauthorizedError();
  }
  return new Twitter({
    oauth_token: twitterAccount.oauth_token,
    oauth_token_secret: twitterAccount.oauth_token_secret,
    userId: twitterAccount.providerAccountId,
  });
}

function parseList({
  id_str,
  name,
  screen_name,
}: {
  id_str: string;
  name: string;
  screen_name: string;
}) {
  return {
    id: id_str,
    name,
    screen_name,
  };
}

function parseTweet(tweet, overwrite = {}) {
  if (tweet.retweeted_status) {
    return parseTweet(tweet.retweeted_status, { isRetweet: true });
  }
  let output = {
    id: tweet.id_str,
    createdAt: dayjs.utc(tweet.created_at).format(),
    text: tweets.autoLink(tweet.text, {
      urlEntities: tweet.entities.urls,
    }),
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
  if (tweet.extended_entities?.media) {
    output.media = tweet.extended_entities.media.map((m) => ({
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
          console.log(limits(response.headers), args[0]);
          resolve({ data, response });
        }
      }
      const parameters = [...args, callback];
      func.apply(func, parameters);
    });
  };
}

function limits(headers: { [key: string]: string }) {
  try {
    const formats: { [key: string]: (v: string) => string } = {
      "x-rate-limit-limit": (v) => v,
      "x-rate-limit-reset": (v) =>
        v ? dayjs(parseInt(v, 10) * 1000).format() : v,
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

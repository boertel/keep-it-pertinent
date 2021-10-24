import tweets from "twitter-text";
import { NextApiRequest } from "next";
import OtherTwitter from "twitter";
import db from "@/db";
import Cookies from "cookies";
import dayjs from "@/dayjs";
import Cache from "@/cache";
import { TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET } from "@/config";

enum HttpMethod {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
  PUT = "PUT",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

interface QueryData {
  [key: string]: any;
}

class TwitterFetcher {
  client: any;

  constructor({
    oauth_token,
    oauth_token_secret,
    uid,
  }: {
    oauth_token: string;
    oauth_token_secret: string;
    uid: string;
  }) {
    // @ts-ignore
    this.client = new OtherTwitter({
      consumer_key: TWITTER_CLIENT_ID,
      consumer_secret: TWITTER_CLIENT_SECRET,
      access_token_key: oauth_token,
      access_token_secret: oauth_token_secret,
    });

    const methods: ["get", "post", "stream"] = ["get", "post", "stream"];
    methods.forEach((method) => {
      this.client[method] = promisify(
        this.client[method].bind(this.client),
        uid
      );
      this[method] = this[method].bind(this);
    });
  }

  get(...args: any[]) {
    return this.client.get(...args);
  }

  post(...args: any[]) {
    return this.client.post(...args);
  }

  stream(...args: any[]) {
    return this.client.stream(...args);
  }
}

class Query {
  method: HttpMethod;
  path: string;
  parameters?: QueryData;

  protected cacheKey?: string;
  protected cache: Cache;

  static fetcher: any;

  constructor(
    method: HttpMethod,
    path: string,
    parameters?: QueryData,
    expiration = 60 * 120
  ) {
    this.method = method;
    this.path = path;
    this.parameters = parameters;

    this.cache = new Cache("twitter", { expiration });

    this.getCacheKey = this.getCacheKey.bind(this);
    this.request = this.request.bind(this);
  }

  setCacheKey(key: string) {
    this.cacheKey = key;
  }

  public getCacheKey(): string {
    if (this.cacheKey) {
      return this.cacheKey;
    } else {
      return Cache.serializeKey([this.method, this.path, this.parameters]);
    }
  }

  request(fetcher: any) {
    return this.cache.wrap(fetcher, this.getCacheKey)(
      this.path,
      this.parameters
    );
  }
}

export default class TwitterQuery extends Query {
  userId?: string;

  constructor(
    method: HttpMethod,
    path: string,
    parameters?: QueryData,
    userId?: string
  ) {
    super(method, path, parameters || {});
    this.userId = userId;
    this.mutate = this.mutate.bind(this);
  }

  getCacheKey(): string {
    const cacheKey = super.getCacheKey();
    if (this.userId) {
      return `${cacheKey}:${this.userId}`;
    }
    return cacheKey;
  }

  async mutate(mutation: any) {
    const key = this.getCacheKey();
    const data: { data: any; response: any } = await this.cache.get(key);
    if (!data) {
      console.warn(
        `skip mutating ${this.getCacheKey()} because cache record is missing`
      );
      return;
    }
    try {
      const newData = mutation(data.data);
      const expiration = await this.cache.ttl(key);
      // -2 means the key doesn't exist
      if (expiration !== -2) {
        await this.cache.set(
          key,
          { data: newData, response: data.response },
          expiration
        );
      }
    } catch (exception) {
      if (!(exception instanceof AbortMutation)) {
        throw exception;
      } else {
        console.warn(`Abort mutation for ${this.getCacheKey()}`);
      }
    }
  }

  request() {
    const fetcher = TwitterQuery.fetcher;
    const method = fetcher[this.method.toLowerCase()];
    console.log("calling", this.getCacheKey().replaceAll('"', '\\"'));
    try {
      if (this.method === HttpMethod.GET) {
        return super.request(method);
      } else {
        return method(this.path, this.parameters);
      }
    } catch (exception) {
      console.error(exception);
    }
  }
}

function append(obj: any) {
  return function (data: any) {
    if (!data.find(({ id_str }: any) => id_str === obj.id_str)) {
      return [...data, obj];
    } else {
      throw new AbortMutation();
    }
  };
}

function remove(id: string) {
  return function (data: any) {
    if (!data.find(({ id_str }: any) => id_str === id)) {
      return data.filter(({ id_str }: any) => id_str !== id);
    } else {
      throw new AbortMutation();
    }
  };
}

class Twitter {
  userId: string;
  queries: { [key: string]: (...args: any[]) => TwitterQuery };

  constructor(userId: string) {
    this.userId = userId;

    this.queries = {
      "/lists/list": () =>
        new TwitterQuery(HttpMethod.GET, "/lists/list", undefined, this.userId),
      "/lists/members": (listId: string) =>
        new TwitterQuery(HttpMethod.GET, "/lists/members", {
          include_entities: false,
          skip_status: true,
          list_id: listId,
        }),
      "/friends/list": (cursor: number = -1) =>
        new TwitterQuery(
          HttpMethod.GET,
          "/friends/list",
          {
            cursor,
            count: 200,
            skip_status: true,
            include_user_entities: true,
          },
          this.userId
        ),
    };
  }

  async getTimeline() {
    const params = {
      exclude_replies: true,
      include_entities: true,
      tweet_mode: "extended",
    };
    const query = new TwitterQuery(
      HttpMethod.GET,
      "/statuses/home_timeline",
      params,
      this.userId
    );
    const { data } = await query.request();
    return data.map(parseTweet);
  }

  async getLists() {
    const { data } = await this.queries["/lists/list"]().request();
    return data.map(parseList);
  }

  async getFollowedUsers({ cursor = -1 }: { cursor?: number }) {
    const query = this.queries["/friends/list"](cursor);
    const { data } = await query.request();
    // FIXME pagination is NOT handled
    // here are the attributes for data [ 'users', 'next_cursor', 'next_cursor_str', 'previous_cursor', 'previous_cursor_str', 'total_count' ]
    return data.users.map(parseUser);
  }

  async getUserByUsername(username?: string) {
    let params = undefined;
    if (username) {
      params = {
        screen_name: username,
      };
    }
    const query = new TwitterQuery(HttpMethod.GET, "/users/lookup", params);
    const { data, response } = await query.request();
    const user = data[0];
    return parseUser(user);
  }

  async getTweetsByUsername(username: string) {
    const params = {
      screen_name: username,
      count: 40,
      exclude_replies: true,
      include_rts: true,
      include_entities: true,
      tweet_mode: "extended",
    };

    const query = new TwitterQuery(
      HttpMethod.GET,
      "/statuses/user_timeline",
      params
    );
    const { data } = await query.request();
    return data.map((t: any) => parseTweet(t));
  }

  async getOrCreateList(name: string, mode?: string) {
    const lists = await this.getLists();
    const existingList = lists.find((list: any) => list.name === name);
    if (existingList) {
      return existingList;
    } else {
      const body = {
        name,
        mode: mode || "private",
      };
      const query = new TwitterQuery(HttpMethod.POST, "/lists/create", body);
      const { data: created } = await query.request();
      const { mutate } = this.queries["/lists/list"]();
      await mutate(append(created));
      return parseList(created);
    }
  }

  async getListMembers(listId: string) {
    const { data } = await this.queries["/lists/members"](listId).request();
    const members: { [key: string]: boolean } = {};
    data.users.forEach(({ screen_name }: { screen_name: string }) => {
      members[screen_name] = true;
    });
    return members;
  }

  async removeFromList(listId: string, username: string, userId: string) {
    const body = {
      list_id: listId,
      screen_name: username,
    };
    const query = new TwitterQuery(
      HttpMethod.POST,
      "/lists/members/destroy",
      body
    );
    await query.request();
    const { mutate } = this.queries["/lists/members"](listId);
    await mutate(({ users = [] }) => {
      return {
        users: remove(userId)(users),
      };
    });
  }

  async addToList(listId: string, username: string, userId: string) {
    const body = {
      list_id: listId,
      screen_name: username,
    };
    const query = new TwitterQuery(
      HttpMethod.POST,
      "/lists/members/create",
      body
    );
    const { data: added } = await query.request();
    const { mutate } = this.queries["/lists/members"](listId);
    await mutate(({ users = [], ...rest }) => {
      return {
        ...rest,
        users: append({ id_str: userId, screen_name: username })(users),
      };
    });
    return added;
  }

  async unfollow(username: string) {
    const body = {
      screen_name: username,
    };
    const query = new TwitterQuery(
      HttpMethod.POST,
      "/friendships/destroy",
      body
    );
    const { data } = await query.request();
    const { mutate } = this.queries["/friends/list"]();
    mutate(({ users = [], ...rest }) => {
      return {
        ...rest,
        users: users.filter(
          ({ screen_name }: { screen_name: string }) => screen_name !== username
        ),
      };
    });

    return data;
  }
}

class AbortMutation extends Error {}

export abstract class HttpError extends Error {
  abstract statusCode: number;
  abstract message: string;
}

class UnauthorizedError extends HttpError {
  statusCode: number = 401;
  message: string = "Unauthorized";
}

export async function createTwitterFromReq(req: NextApiRequest) {
  // @ts-ignore
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
    ({ provider }: { provider: string }) => provider === "twitter"
  );
  if (!twitterAccount) {
    throw new UnauthorizedError();
  }
  const fetcher = new TwitterFetcher({
    oauth_token: twitterAccount.oauth_token,
    oauth_token_secret: twitterAccount.oauth_token_secret,
    uid: twitterAccount.providerAccountId,
  });

  TwitterQuery.fetcher = fetcher;
  return new Twitter(twitterAccount.providerAccountId);
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

interface Url {
  displayUrl: string;
  expandedUrl: string;
}

interface Author {
  avatar: string;
  name: string;
  id: string;
  location: string;
  username: string;
  createdAt: string;
  tweetsCount: number;
  description: string;
  urls: Url[];
}

interface Media {
  id: string;
  url: string;
}

interface Tweet {
  id: string;
  createdAt: string;
  text: string;
  author: Author;
  isRetweet: boolean;
  retweet?: Tweet;
  media?: Media[];
}

function parseTweet(tweet: any, overwrite = {}): Tweet {
  if (tweet.retweeted_status) {
    return parseTweet(tweet.retweeted_status, { isRetweet: true });
  }

  let text: string = tweet.full_text || tweet.text;
  try {
    text = tweets.autoLink(text, {
      urlEntities: tweet.entities.urls,
    });
  } catch (exception) {
    console.error(exception);
  }
  let output: Tweet = {
    id: tweet.id_str,
    createdAt: dayjs.utc(tweet.created_at).format(),
    text,
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
    output.media = tweet.extended_entities.media.map((m: any) => ({
      id: m.id_str,
      url: m.media_url_https,
    }));
  }
  return output;
}

function parseUser(user: any): Author {
  return {
    avatar: user.profile_image_url_https,
    name: user.name,
    id: user.id_str,
    location: user.location,
    username: user.screen_name,
    createdAt: dayjs.utc(user.created_at).format(),
    tweetsCount: user.statuses_count,
    description: user.description,
    urls: user?.entities?.url?.urls.map(
      ({
        display_url,
        expanded_url,
      }: {
        display_url: string;
        expanded_url: string;
      }) => ({
        displayUrl: display_url,
        expandedUrl: expanded_url,
      })
    ),
  };
}

function promisify(func: any, uid: string) {
  return function (...args: any) {
    return new Promise((resolve, reject) => {
      function callback(error: any, data: any, response: any) {
        if (error) {
          reject(error);
        } else {
          console.log(limits(response.headers), uid, args[0]);
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

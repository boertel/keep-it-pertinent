const { data } = require("./current.json");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const get = require("lodash.get");

const START = 2;
const END = 17;
for (let i = START; i < END; i++) {
  const currentTweet = data[i];
  console.log(`-------------------${i}------------------`);
  relations(currentTweet, 0);
  console.log("--------------------------------------");
  console.log(parseTweet(currentTweet));
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
      src: m.media_url_https,
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

function relation(tweet, index) {
  console.log(
    index,
    JSON.stringify({
      is_retweeted: tweet.retweeted,
      has_retweeted_status: !!tweet.retweeted_status,
      is_quote_status: tweet.is_quote_status,
      has_quoted_status: !!tweet.quoted_status,
      text: tweet.text.substring(0, 40) + "...",
      screen_name: get(tweet, "user.screen_name"),
    })
  );
  //["retweeted", "is_quote_status", "text"]));
}

function relations(tweet, index) {
  let output = {};

  relation(tweet, index + 1);
  if (tweet.quoted_status) {
    relations(tweet.quoted_status, index + 1);
  }
  if (tweet.retweeted_status) {
    relations(tweet.retweeted_status, index + 1);
  }

  /*
  output = {
    id: tweet.id_str,
    createdAt: dayjs.utc(tweet.created_at).format(),
    text: tweet.text,
    author: parseUser(tweet.user),
    isRetweet: tweet.retweeted,
    isQuote: tweet.is_quote_status,
  };
  */
  return output;
}

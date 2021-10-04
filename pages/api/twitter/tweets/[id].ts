import twitter from "@/twitter";

export default async function tweets(req, res) {
  const { data: user } = await twitter.get(
    `/users/by/username/${req.query.id}`,
    {
      params: {
        "user.fields":
          "description,location,name,id,profile_image_url,username,entities,public_metrics",
      },
    }
  );
  console.log(user);
  const { data } = await twitter.get(`/users/${user.data.id}/tweets`, {
    params: {
      exclude: "replies",
      expansions:
        "attachments.media_keys,author_id,referenced_tweets.id.author_id,entities.mentions.username",
      "media.fields": "preview_image_url,url,height",
      "tweet.fields": "author_id,created_at,referenced_tweets,entities",
      max_results: 20,
    },
  });
  let users = {};
  data?.includes?.users?.forEach((user) => {
    users[user.id] = user;
  });
  let tweets = {};
  console.log(data?.includes);
  data?.includes?.tweets?.forEach((tweet) => {
    tweets[tweet.id] = tweet;
  });
  let media = {};
  data?.includes?.media?.forEach((m) => {
    media[m.media_key] = m;
  });
  return res.status(200).json({
    ...data,
    includes: {
      ...data.includes,
      media,
      users,
      tweets,
    },
  });
}

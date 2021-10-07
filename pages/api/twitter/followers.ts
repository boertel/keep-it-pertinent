import twitter from "@/twitter";

export default async function followers(req, res) {
  const username = "boertel";

  const {
    data: { data: user },
  } = await twitter.get(`/2/users/by/username/${username}`);
  const { data } = await twitter.get(`/2/users/${user.id}/following`, {
    params: { "user.fields": "profile_image_url", max_results: 500 },
  });
  return res.status(200).json(data);
}

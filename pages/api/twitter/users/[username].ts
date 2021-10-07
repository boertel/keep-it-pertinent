import twitter from "@/twitter";

export default async function user(req, res) {
  const { data } = await twitter.get(
    `/2/users/by/username/${req.query.username}`,
    {
      params: {
        "user.fields":
          "description,location,name,id,profile_image_url,username,entities,public_metrics",
      },
    }
  );
  return res.status(200).json(data);
}

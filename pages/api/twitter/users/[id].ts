import twitter from "@/twitter";

export default async function user(req, res) {
  const { data } = await twitter.get(`/users/${req.query.id}`, {
    params: {
      "user.fields":
        "description,location,name,id,profile_image_url,username,entities",
    },
  });
  return res.status(200).json(data);
}

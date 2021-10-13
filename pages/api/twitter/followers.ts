import { createTwitterFromReq } from "@/twitter";

export default async function followers(req, res) {
  const t = await createTwitterFromReq(req);

  const data = await t.getFollowedUsers();
  return res.status(200).json({ data });
}

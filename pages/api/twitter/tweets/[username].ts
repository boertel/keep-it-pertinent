import { createTwitterFromReq } from "@/twitter";

export default async function tweets(req, res) {
  const t = await createTwitterFromReq(req);

  const data = await t.getTweetsByUsername(req.query.username);
  return res.status(200).json({ data });
}

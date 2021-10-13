import { createTwitterFromReq } from "@/twitter";

export default async function user(req, res) {
  const t = await createTwitterFromReq(req);

  const data = await t.getUserByUsername(req.query.username);
  return res.status(200).json({ data });
}

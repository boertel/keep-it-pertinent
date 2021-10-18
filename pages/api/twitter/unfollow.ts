import { createTwitterFromReq } from "@/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function unfollow(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const t = await createTwitterFromReq(req);

  const list = await t.getOrCreateList("Kip Archive");
  const { username } = req.body;
  await t.addToList(list.id, username);
  await t.unfollow(username);

  return res.status(200).json({ ok: true });
}

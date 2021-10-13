import { createTwitterFromReq } from "@/twitter";

export default async function unfollow(req, res) {
  const t = await createTwitterFromReq(req);

  const list = await t.getOrCreateList("Expiration Archive");
  const { username } = req.body;
  await t.addToList(list.id, username);
  await t.unfollow(username);

  return res.status(200).json({ ok: true });
}

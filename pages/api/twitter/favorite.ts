import { createTwitterFromReq } from "@/twitter";

export default async function favorite(req, res) {
  const t = await createTwitterFromReq(req);

  const list = await t.getOrCreateList("favorites");
  const { username } = req.body;
  await t.addToList(list.id, username);

  return res.status(200).json({ ok: true });
}

import { createTwitterFromReq } from "@/twitter";

export default async function list(req, res) {
  const { args } = req.query;

  const t = await createTwitterFromReq(req);

  if (req.method === "GET") {
    return res.json(await t.getLists());
  } else if (req.method === "POST") {
    const listId = args[0];
    const data = await t.addToList(listId, req.body.username);
    return res.json(data);
  }
}

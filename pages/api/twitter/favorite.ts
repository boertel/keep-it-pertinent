import { createTwitterFromReq } from "@/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function favorite(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const t = await createTwitterFromReq(req);

    const list = await t.getOrCreateList("favorites");

    if (req.method === "POST") {
      const { username, userId } = req.body;
      await t.addToList(list.id, username, userId);
      return res.status(200).json({ ok: true });
    } else if (req.method === "DELETE") {
      const { username, userId } = req.body;
      await t.removeFromList(list.id, username, userId);
      return res.status(200).json({ ok: true });
    }
  } catch (exception: any) {
    console.error(exception);
    return res
      .status(exception.statusCode || 500)
      .json({ message: exception.message });
  }
}

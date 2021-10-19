import { createTwitterFromReq } from "@/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function favorite(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const t = await createTwitterFromReq(req);

    const list = await t.getOrCreateList("favorites");
    const { username } = req.body;
    await t.addToList(list.id, username);

    return res.status(200).json({ ok: true });
  } catch (exception: any) {
    return res
      .status(exception.statusCode)
      .json({ message: exception.message });
  }
}

import { createTwitterFromReq } from "@/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function unfollow(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const t = await createTwitterFromReq(req);

    const list = await t.getOrCreateList("Kip Archive");
    const { username, userId } = req.body;
    await t.addToList(list.id, username, userId);
    await t.unfollow(username);

    return res.status(200).json({ ok: true });
  } catch (exception: any) {
    console.error(exception);
    return res
      .status(exception.statusCode || 500)
      .json({ message: exception.message });
  }
}

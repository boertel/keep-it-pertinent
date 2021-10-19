import { createTwitterFromReq } from "@/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function list(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { args } = req.query;

    const t = await createTwitterFromReq(req);

    if (req.method === "GET") {
      return res.json(await t.getLists());
    } else if (req.method === "POST") {
      const listId = args[0];
      const data = await t.addToList(listId, req.body.username);
      return res.json(data);
    }
  } catch (exception: any) {
    return res
      .status(exception.statusCode)
      .json({ message: exception.message });
  }
}

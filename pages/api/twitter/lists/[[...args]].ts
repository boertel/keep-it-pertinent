import { createTwitterFromReq } from "@/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function list(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { args } = req.query;
    let listId;
    let action;
    if (args) {
      if (args.length > 0) {
        listId = args[0];
        if (args.length > 1) {
          action = args[1];
        }
      }
    }

    const t = await createTwitterFromReq(req);

    if (req.method === "GET") {
      if (listId) {
        return res.json(await t.getListMembers(listId));
      } else {
        return res.json(await t.getLists());
      }
    } else if (req.method === "POST" && listId) {
      const data = await t.addToList(listId, req.body.username);
      return res.json(data);
    }
  } catch (exception: any) {
    console.error(exception);
    return res
      .status(exception.statusCode || 500)
      .json({ message: exception.message });
  }
}

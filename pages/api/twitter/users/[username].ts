// @ts-nocheck
import { createTwitterFromReq } from "@/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function user(req: NextApiRequest, res: NextApiResponse) {
  const t = await createTwitterFromReq(req);

  const data = await t.getUserByUsername(req.query.username);
  return res.status(200).json({ data });
}

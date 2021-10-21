//@ts-nocheck
import { NextApiRequest, NextApiResponse } from "next";
import { createTwitterFromReq } from "@/twitter";

export default async function tweets(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const t = await createTwitterFromReq(req);

    const data = await t.getTweetsByUsername(req.query.username);
    return res.status(200).json({ data });
  } catch (exception: any) {
    return res
      .status(exception.statusCode || 500)
      .json({ message: exception.message });
  }
}

import { createTwitterFromReq } from "@/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function timeline(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const t = await createTwitterFromReq(req);

    const tweets = await t.getTimeline();
    return res.status(200).json(tweets);
  } catch (exception: any) {
    console.error(exception);
    return res
      .status(exception.statusCode || 500)
      .json({ message: exception.message });
  }
}

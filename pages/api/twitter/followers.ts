import { createTwitterFromReq } from "@/twitter";
import { NextApiRequest, NextApiResponse } from "next";

export default async function followers(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const t = await createTwitterFromReq(req);

    const data = await t.getFollowedUsers();
    return res.status(200).json({ data });
  } catch (exception: any) {
    return res
      .status(exception.statusCode)
      .json({ message: exception.message });
  }
}

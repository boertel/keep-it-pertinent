import Twitter from "@/twitter";

export default async function user(req, res) {
  const t = new Twitter({
    oauth_token: "102964419-va2cMyN6ujyOc8VgLwGcn1xn0Zv5hXDnVGn5YsDT",
    oauth_token_secret: "pKGl51gACJVbm0lo8BOwP6Q3yHHPONIytkrGrN0r8MTSY",
  });

  const data = await t.getUserByUsername(req.query.username);
  return res.status(200).json({ data });
}

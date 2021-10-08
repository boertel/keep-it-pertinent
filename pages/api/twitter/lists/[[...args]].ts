import Twitter from "@/twitter";

export default async function list(req, res) {
  const { args } = req.query;

  const t = new Twitter({
    oauth_token: "102964419-va2cMyN6ujyOc8VgLwGcn1xn0Zv5hXDnVGn5YsDT",
    oauth_token_secret: "pKGl51gACJVbm0lo8BOwP6Q3yHHPONIytkrGrN0r8MTSY",
  });

  if (req.method === "GET") {
    const { data } = await t.get("lists/list");
    return res.json(data);
  } else if (req.method === "POST") {
    const body = {
      userId: req.body.userId,
    };
    const { data } = await twitter.post(`/lists/${listId}/members`, body);
    return res.json(data);
  }
}

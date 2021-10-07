import twitter from "@/twitter";

export default async function list(req, res) {
  const { listId } = req.query;

  if (req.method === "GET") {
    const { data, ...etc } = await twitter.get(
      `/1.1/lists/list.json?screen_name=boertel`
    );
    console.log(etc);
    return res.json(data);
  } else if (req.method === "POST") {
    const body = {
      userId: req.body.userId,
    };
    const { data } = await twitter.post(`/lists/${listId}/members`, body);
    return res.json(data);
  }
}

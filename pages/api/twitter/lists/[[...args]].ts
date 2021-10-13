import Twitter from "@/twitter";

export default async function list(req, res) {
  const { args } = req.query;

  const t = new Twitter({
    oauth_token: "102964419-u84KlIMhYuofF1soXSTAq82uZpoe5DfaBSdjN5gS",
    oauth_token_secret: "kjvS4qWISvihamU85lgGuOtsmRVWFNBGZelRzF4UU94eA",
  });

  if (req.method === "GET") {
    const { data } = await t.get("lists/list");
    return res.json(data.map(({ id_str, name }) => ({ id: id_str, name })));
  } else if (req.method === "POST") {
    const body = {
      list_id: args[0],
      screen_name: req.body.username,
    };
    console.log(body);
    const { data } = await t.post(`/lists/members/create`, body);
    return res.json(data);
  }
}

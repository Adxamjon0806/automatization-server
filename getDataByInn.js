import dotenv from "dotenv";

dotenv.config();

async function getDataByInn(req, res) {
  try {
    const { inn } = req.body;
    let info;
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.set("user-key", process.env.INN_USER_KEY);
    headers.set("Partner-Authorization", process.env.INN_PARTNER_AUTH);

    await fetch(`https://stage.goodsign.biz/v1/utils/info/${inn}`, {
      method: "GET",
      headers,
    })
      .then((response) => response.json())
      .then((data) => {
        info = data;
      });

    res.status(200).json(info);
  } catch (e) {
    console.error("Error at getting the data by INN", e);
  }
}

export { getDataByInn };

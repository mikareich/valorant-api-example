const auth = require("./auth");
const getPlayer = require("./player");

async function fetchStore(username, password, region) {
  const { accessToken, entitelmentToken } = await auth(username, password);
  const player = await getPlayer(accessToken);

  const response = await fetch(
    `https://pd.${region}.a.pvp.net/store/v2/storefront/${player.puuid}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-Riot-Entitlements-JWT": entitelmentToken,
      },
    }
  );

  const data = await response.json();

  const store = data.SkinsPanelLayout.SingleItemStoreOffers.map((item) => ({
    id: item.OfferID,
    price: Object.values(item.Cost)[0],
  }));

  return {
    store,
    resetsAt: new Date(
      Date.now() +
        data.SkinsPanelLayout.SingleItemOffersRemainingDurationInSeconds * 1000
    ),
  };
}

fetchStore("rikameich", "a9t13zy44gfd", "eu").then(console.log);

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

// region = eu, na, ap...
fetchStore("username", "password", "region").then(console.log);

// {
//   store: [
//     { id: '87220abc-49a9-7472-ae09-29a6d711bbc3', price: 2175 },
//     { id: '7302d465-46cd-2a43-655f-93aee59030db', price: 3550 },
//     { id: '3bf9d39f-46b4-ba23-e079-488d799b9416', price: 1275 },
//     { id: '0296ff9b-4172-5a29-7d25-a7bf491b5bd4', price: 1775 }
//   ],
//   resetsAt: 2023-11-22T23:59:58.709Z
// }

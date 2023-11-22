/**
 * Fetches player data from Riot Games API using the access token
 * @param {string} accessToken Unique access token for the account
 * @returns Player data
 */
async function getPlayer(accessToken) {
  const response = await fetch("https://auth.riotgames.com/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  return {
    name: data.acct.game_name,
    tag: data.acct.tag_line,
    region: data.affinity.pp,
    puuid: data.sub,
  };
}

module.exports = getPlayer;

/**
 * Returns the access token and entitelment token for the given account with no 2FA.
 * @param {string} username Username of the account
 * @param {string} password Password of the account
 */
async function auth(username, password) {
  const AUTH_URL = "https://auth.riotgames.com/api/v1/authorization";

  // prepare auth
  const authPrepareResponse = await fetch(AUTH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: "play-valorant-web-prod",
      nonce: "1",
      redirect_uri: "https://playvalorant.com/opt_in",
      response_type: "token id_token",
      scope: "account openid",
    }),
  });
  const cookies = authPrepareResponse.headers.getSetCookie();

  if (!cookies) throw new Error("No cookies found");

  // auth request
  const authRequestResponse = await fetch(AUTH_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies.join("; "),
    },
    body: JSON.stringify({
      type: "auth",
      username,
      password,
      remember: false,
      language: "en_US",
    }),
  });

  const data = await authRequestResponse.json();
  if ("error" in data) throw new Error(data.error);

  // extract auth tokens
  const authUrl = new URL(data.response.parameters.uri);
  const searchParams = new URLSearchParams(authUrl.hash.substring(1));
  const accessToken = searchParams.get("access_token");

  if (!accessToken) throw new Error("No access token found");

  // fetch entitlement token
  const entitlementResponse = await fetch(
    "https://entitlements.auth.riotgames.com/api/token/v1",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const entitlementData = await entitlementResponse.json();
  const entitelmentToken = entitlementData.entitlements_token;

  if (!entitelmentToken) throw new Error("No entitelment token found");

  return { accessToken, entitelmentToken };
}

module.exports = auth;

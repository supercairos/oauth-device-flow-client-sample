import { Issuer } from "openid-client";

const OAUTH_URL = "http://localhost:4444/.well-known/openid-configuration";
const OAUTH_REDIRECT_URI = "http://localhost:1337/hello";
const OAUTH_CLIENT_ID = "shadow-client";
const OAUTH_CLIENT_SECRET = "secret";
const OAUTH_SCOPES = "openid";

const authUser = async () => {
  await Issuer.discover(OAUTH_URL)
    .then((value) => {
      console.log(value.metadata);
      return new value.Client({
        client_id: OAUTH_CLIENT_ID,
        redirect_uris: [OAUTH_REDIRECT_URI],
        response_types: ["code"],
        token_endpoint_auth_method: "none",
      });
    })
    .then((client) => {
      console.log(JSON.stringify(client.metadata));
      return client.deviceAuthorization({
        scope: OAUTH_SCOPES,
      });
    })
    .then((handler) => {
      console.log(
        `Got user token: ${handler.user_code} & device code: ${handler.user_code}`
      );
      console.log(`Open URL: ${handler.verification_uri}`);
      console.log(`Start polling on client side`);
      return handler.poll();
    })
    .then((tokenSet) => {
      console.log(`Got token: ${JSON.stringify(tokenSet)}`);
      return tokenSet.claims();
    })
    .then((userInfo) => {
      console.log(`Got userInfo: ${userInfo}`);
    })
    .catch((error) => {
      throw error;
    });
};

authUser();

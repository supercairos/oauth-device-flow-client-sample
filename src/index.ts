import { Issuer } from "openid-client";

const OAUTH_URL = "http://localhost:4444/.well-known/openid-configuration";
const OAUTH_REDIRECT_URI = "http://localhost:1337/hello";
// const OAUTH_CLIENT_ID = "noauth";
const OAUTH_CLIENT_ID = "test";
const OAUTH_CLIENT_SECRET = "secret";
const OAUTH_SCOPES = "openid";

// hydra clients create \
//     --endpoint http://127.0.0.1:4445 \
//     --id noauth \
//     --grant-types authorization_code,refresh_token,urn:ietf:params:oauth:grant-type:device_code \
//     --response-types code,id_token \
//     --scope openid,offline \
//     --callbacks http://localhost:1337/hello \
//     --token-endpoint-auth-method none

// hydra clients create \
//     --endpoint http://127.0.0.1:4445 \
//     --id test \
//     --secret secret \
//     --grant-types authorization_code,refresh_token,urn:ietf:params:oauth:grant-type:device_code \
//     --response-types code,id_token \
//     --scope openid,offline \
//     --callbacks http://localhost:1337/hello

const authUser = async () => {
  await Issuer.discover(OAUTH_URL)
    .then((value) => {
      console.log(value.metadata);
      return new value.Client({
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        redirect_uris: [OAUTH_REDIRECT_URI],
        response_types: ["code"],
        // token_endpoint_auth_method: "none",
      });
    })
    .then((client) => {
      console.log(JSON.stringify(client.metadata));
      return Promise.all([
        client.deviceAuthorization({
          scope: OAUTH_SCOPES,
        }),
        client,
      ]);
    })
    .then(([handler, client]) => {
      console.log(
        `Got user token: ${handler.user_code} & device code: ${handler.device_code}`
      );
      console.log(`Open URL: ${handler.verification_uri}`);
      console.log(`Start polling on client side`);
      return Promise.all([handler.poll(), client]);
    })
    .then(([tokenSet, client]) => {
      console.log(`Got token: ${JSON.stringify(tokenSet)}`);
      return client.userinfo(tokenSet);
    })
    .then((userInfo) => {
      console.log(`Got userInfo: ${JSON.stringify(userInfo)}`);
    })
    .catch((error) => {
      throw error;
    });
};

authUser();

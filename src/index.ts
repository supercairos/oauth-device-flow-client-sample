import { Issuer } from "openid-client";
import qrcode from "qrcode-terminal";

const OAUTH_URL = "http://localhost:4444/.well-known/openid-configuration";
// const OAUTH_URL = "https://api.shadow.tech/.well-known/openid-configuration";
const OAUTH_REDIRECT_URI = "http://localhost:1337/hello";
const OAUTH_CLIENT_ID = "c450fc8f-a957-4350-8621-a196d648835d";
// const OAUTH_CLIENT_ID = "noauth";
// const OAUTH_CLIENT_ID = "59cda39e-2ec8-400b-b2fa-8cfc790fff24";
const OAUTH_CLIENT_SECRET = "QJiupqvzVd.BVCzumqGvfVF-2F";
const OAUTH_SCOPES = "openid offline";

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
        `Got user token: ${handler.user_code} | URL: ${handler.verification_uri_complete}`
      );
      qrcode.generate(handler.verification_uri_complete, { small: true });
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

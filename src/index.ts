import { Issuer, generators } from "openid-client";
import qrcode from "qrcode-terminal";

const OAUTH_URL = "http://localhost:4444/.well-known/openid-configuration";
const OAUTH_REDIRECT_URI = "http://localhost:1337/hello";
const OAUTH_CLIENT_ID = "42a21d92-5140-4f1b-b2aa-ab85f3847857";
const OAUTH_SCOPES = "openid offline profile email";

// ./hydra create client \
//     --endpoint http://127.0.0.1:4445 \
//     --grant-type id_token,authorization_code,refresh_token,urn:ietf:params:oauth:grant-type:device_code \
//     --response-type code,id_token \
//     --scope openid,offline,profile,email \
//     --redirect-uri http://localhost:1337/hello --token-endpoint-auth-method none

const codeVerifier = generators.codeVerifier();
const codeChallenge = generators.codeChallenge(codeVerifier);

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

import { discoverEmberDataModels } from "ember-cli-mirage";
import { createServer, Response } from "miragejs";

const REALM = "test-realm";
const REALM_PATH = `/realms/${REALM}`;

export default function makeServer(config) {
  return createServer({
    ...config,
    models: { ...discoverEmberDataModels(config.store), ...config.models },
    routes() {
      this.urlPrefix = "http://localhost:4200";
      this.namespace = "";
      this.timing = 0;

      this.get(`${REALM_PATH}/.well-known/openid-configuration`, () => {
        const config = {
          issuer: this.urlPrefix,
          authorization_endpoint: `${this.urlPrefix}${REALM_PATH}/protocol/openid-connect/auth`,
          token_endpoint: `${this.urlPrefix}${REALM_PATH}/protocol/openid-connect/token`,
          userinfo_endpoint: `${this.urlPrefix}${REALM_PATH}/protocol/openid-connect/userinfo`,
          end_session_endpoint: `${this.urlPrefix}${REALM_PATH}/protocol/openid-connect/logout`,
          jwks_uri: `${this.urlPrefix}/jwks.json`,
          registration_endpoint: `${this.urlPrefix}/connect/register`,
        };
        return new Response(200, {}, config);
      });
      this.post(`${REALM_PATH}/protocol/openid-connect/token`, {
        access_token: "access.token",
        refresh_token: "refresh.token",
        id_token: "id.token",
      });
      this.get(`${REALM_PATH}/protocol/openid-connect/userinfo`, {
        sub: 1,
      });
      this.get("/users");
      this.get("/users/1", {}, 401);

      this.post("/graphql", (_, request) => {
        const { query } = JSON.parse(request.requestBody);

        if (query.startsWith("mutation")) {
          return new Response(401);
        }

        return new Response(
          200,
          {},
          {
            data: { items: [{ id: 1, name: "Test" }] },
          },
        );
      });
    },
  });
}

import { discoverEmberDataModels } from "ember-cli-mirage";
import { createServer, Response } from "miragejs";

export default function makeServer(config) {
  return createServer({
    ...config,
    models: { ...discoverEmberDataModels(config.store), ...config.models },
    routes() {
      this.urlPrefix = "http://localhost:4200";
      this.namespace = "";
      this.timing = 0;

      this.post("/realms/test-realm/protocol/openid-connect/token", {
        access_token: "access.token",
        refresh_token: "refresh.token",
        id_token: "id.token",
      });
      this.get("/realms/test-realm/protocol/openid-connect/userinfo", {
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

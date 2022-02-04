import { discoverEmberDataModels } from "ember-cli-mirage";
import { createServer } from "miragejs";

export default function makeServer(config) {
  return createServer({
    ...config,
    models: { ...discoverEmberDataModels(), ...config.models },
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
    },
  });
}

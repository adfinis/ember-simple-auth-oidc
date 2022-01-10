import { Response } from "miragejs";

export default function () {
  this.urlPrefix = "http://localhost:4200";
  this.namespace = "";
  this.timing = 0;

  this.post("/realms/test-realm/protocol/openid-connect/token", function () {
    return {
      access_token: "access.token",
      refresh_token: "refresh.token",
      id_token: "id.token",
    };
  });

  this.get("/realms/test-realm/protocol/openid-connect/userinfo", function () {
    return { sub: 1 };
  });

  this.get("/users");

  this.get("/users/1", function () {
    return new Response(401);
  });
}

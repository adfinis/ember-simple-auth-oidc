export default function () {
  this.urlPrefix = "http://localhost:4200";
  this.namespace = "";
  this.timing = 0;

  this.post("/realms/test-realm/protocol/openid-connect/token", function () {
    return {
      access_token: "access.token",
      refresh_token: "refresh.token",
    };
  });

  this.get("/realms/test-realm/protocol/openid-connect/userinfo", function () {
    return { sub: 1 };
  });
}

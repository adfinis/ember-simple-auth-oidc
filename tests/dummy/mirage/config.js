export default function() {
  this.urlPrefix = "";
  this.namespace = "";
  this.timing = 0;

  this.post("/realms/test-realm/protocol/openid-connect/token", function() {
    let tokenBody = btoa(
      JSON.stringify({
        exp: Math.round(new Date().getTime() + (30 * 60 * 1000) / 1000)
      })
    );

    return {
      access_token: `access.${tokenBody}.token`,
      refresh_token: `refresh.${tokenBody}.token`
    };
  });

  this.post(
    "/realms/test-realm/protocol/openid-connect/logout",
    () => null,
    200
  );
}

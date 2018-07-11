import Route from "@ember/routing/route";

export default Route.extend({
  redirect(
    _,
    {
      queryParams: { redirect_uri, state }
    }
  ) {
    window.location.replace(`${redirect_uri}?code=123456789&state=${state}`);
  }
});

import Route from "@ember/routing/route";

export default Route.extend({
  redirect(_, transition) {
    const { redirect_uri, state } = transition.to
      ? transition.to.queryParams
      : transition.queryParams;
    window.location.replace(`${redirect_uri}?code=123456789&state=${state}`);
  },
});

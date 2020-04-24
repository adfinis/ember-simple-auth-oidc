import Route from "@ember/routing/route";

export default Route.extend({
  redirect(_, transition) {
    const { post_logout_redirect_uri } = transition.to
      ? transition.to.queryParams
      : transition.queryParams;
    window.location.replace(post_logout_redirect_uri);
  },
});

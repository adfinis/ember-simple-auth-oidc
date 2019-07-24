import ApplicationRouteMixin from "ember-simple-auth/mixins/application-route-mixin";
import Mixin from "@ember/object/mixin";

export default Mixin.create(ApplicationRouteMixin, {
  /**
   * This method is called after a successful authentication and continues an
   * intercepted transition if a URL is stored in `continueTransition` in the
   * localstorage. Otherwise call the parent/super to invoke the normal
   * behavior of the `sessionAuthenticated` method.
   *
   * @method sessionAuthenticated
   * @public
   */
  sessionAuthenticated() {
    const continueTransition = this.get("session.data.continueTransition");
    this.set("session.data.continueTransition", undefined);

    if (continueTransition) {
      this.replaceWith(continueTransition);
    } else {
      this._super();
    }
  },

  sessionInvalidated() {
    /**
     * Overwrite the standard behavior of the
     * sessionInvalidated event, which is redirecting
     * to the rootUrl of the app. Since the OIDC addon
     * redirects to the end-session endpoint after
     * invalidating, this event should do nothing
     * (or at least no redirecting!).
     */
  }
});

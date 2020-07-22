import Mixin from "@ember/object/mixin";
import { inject as service } from "@ember/service";
import ApplicationRouteMixin from "ember-simple-auth/mixins/application-route-mixin";

export default Mixin.create(ApplicationRouteMixin, {
  session: service(),
  router: service(),

  /**
   * This method is called after a successful authentication and continues an
   * intercepted transition if a URL is stored in `nextURL` in the
   * localstorage. Otherwise call the parent/super to invoke the normal
   * behavior of the `sessionAuthenticated` method.
   *
   * @method sessionAuthenticated
   * @public
   */
  sessionAuthenticated() {
    const nextURL = this.session.data.nextURL;
    this.session.set("data.nextURL", undefined);

    if (nextURL) {
      this.replaceWith(nextURL);
    } else {
      this._super();
    }
  },

  sessionInvalidated() {
    /**
     * Overwriting the standard behavior of the sessionInvalidated event,
     * which is redirecting to the rootURL of the app. Since the OIDC addon
     * also triggers a redirect in some cases and this could lead to conflicts
     * we disable the ember-simple-auth behavior.
     * If you wish to redirect after invalidating the session, please handle
     * this by overwriting this event in your application route or at the
     * exact location where the session is invalidated.
     */
  },
});

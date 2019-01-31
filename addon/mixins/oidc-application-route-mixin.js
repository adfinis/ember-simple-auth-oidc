import ApplicationRouteMixin from "ember-simple-auth/mixins/application-route-mixin";
import Mixin from "@ember/object/mixin";

export default Mixin.create(ApplicationRouteMixin, {
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

import Ember from "ember";
import config from "ember-simple-auth-oidc/config";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absoluteUrl";

const { afterLogoutUri } = config;

export const handleUnauthorized = (session) => {
  if (session.isAuthenticated) {
    session.set("data.nextURL", location.href.replace(location.origin, ""));
    session.invalidate();

    const url = afterLogoutUri || "";

    if (!Ember.testing) {
      location.replace(getAbsoluteUrl(url));
    }
  }
};

export default { handleUnauthorized };

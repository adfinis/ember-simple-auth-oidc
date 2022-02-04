import { getOwner } from "@ember/application";
import { getConfig } from "ember-simple-auth-oidc/config";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absoluteUrl";

export const handleUnauthorized = (session) => {
  if (session.isAuthenticated) {
    session.set("data.nextURL", location.href.replace(location.origin, ""));
    session.invalidate();

    const owner = getOwner(session);

    if (
      owner.resolveRegistration("config:environment").environment !== "test"
    ) {
      location.replace(getAbsoluteUrl(getConfig(owner).afterLogoutUri || ""));
    }
  }
};

export default { handleUnauthorized };

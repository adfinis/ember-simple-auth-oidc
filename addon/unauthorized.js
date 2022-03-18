import { getOwner } from "@ember/application";
import { isTesting, macroCondition } from "@embroider/macros";

import { getConfig } from "ember-simple-auth-oidc/config";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absoluteUrl";

export default function handleUnauthorized(session) {
  if (session.isAuthenticated) {
    session.set("data.nextURL", location.href.replace(location.origin, ""));
    session.invalidate();

    if (macroCondition(isTesting())) {
      // don't redirect in tests
    } else {
      location.replace(
        getAbsoluteUrl(getConfig(getOwner(session)).afterLogoutUri || "")
      );
    }
  }
}

import { getOwner } from "@ember/application";
import { next } from "@ember/runloop";
import { isTesting, macroCondition } from "@embroider/macros";

import { getConfig } from "ember-simple-auth-oidc/config";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absolute-url";

export default function handleUnauthorized(session) {
  if (session.isAuthenticated) {
    // Only store current location for redirect if the session is not
    // invalidated yet.
    session.set("data.nextURL", location.href.replace(location.origin, ""));
    session.invalidate();
  }
  if (macroCondition(isTesting())) {
    // don't redirect in tests
  } else {
    // defer the redirect, so the first unauthenticated request can trigger
    // the redirect to the login page before another request will intercept
    // the process and a race condition would start.
    next(() => {
      location.replace(
        getAbsoluteUrl(getConfig(getOwner(session)).afterLogoutUri || "")
      );
    });
  }
}

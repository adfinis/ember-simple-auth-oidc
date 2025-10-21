import { assert } from "@ember/debug";
import {
  dependencySatisfies,
  macroCondition,
  importSync,
} from "@embroider/macros";
import { handleUnauthorized } from "ember-simple-auth-oidc";

let apolloMiddleware;

if (macroCondition(dependencySatisfies("@apollo/client", "^3.13.0"))) {
  const { setContext } = importSync("@apollo/client/link/context");
  const { onError } = importSync("@apollo/client/link/error");

  apolloMiddleware = (httpLink, session) => {
    const authMiddleware = setContext(async (_, context) => {
      await session.refreshAuthentication.perform();

      return {
        ...context,
        headers: {
          ...context.headers,
          ...session.headers,
        },
      };
    });

    const authAfterware = onError((error) => {
      if (error.networkError && error.networkError.statusCode === 401) {
        handleUnauthorized(session);
      }
    });

    return authMiddleware.concat(authAfterware).concat(httpLink);
  };
} else {
  apolloMiddleware = () =>
    assert(
      "@apollo/client ^3.13.0 must be installed in order to use the apollo middleware",
    );
}

export default apolloMiddleware;

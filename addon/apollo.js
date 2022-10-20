import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { handleUnauthorized } from "ember-simple-auth-oidc";

export default function apolloMiddleware(httpLink, session) {
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
}

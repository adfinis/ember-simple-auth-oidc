import { set } from "@ember/object";

export const handleUnauthorized = session => {
  if (session.isAuthenticated) {
    set(session, "data.nextURL", location.href.replace(location.origin, ""));
    session.invalidate();
  }
};

export default { handleUnauthorized };

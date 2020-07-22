import SessionServiceESA from "ember-simple-auth/services/session";

export default SessionServiceESA.extend({
  singleLogout() {
    const session = this.session; // InternalSession
    const authenticator = session._lookupAuthenticator(session.authenticator);
    const idToken = this.data.authenticated.id_token;

    // Invalidate the ember-simple-auth session
    this.invalidate();

    // Trigger a single logout on the authorization server
    return authenticator.singleLogout(idToken);
  },
});

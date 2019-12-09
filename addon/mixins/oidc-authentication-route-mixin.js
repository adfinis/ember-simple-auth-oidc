import UnauthenticatedRouteMixin from "ember-simple-auth/mixins/unauthenticated-route-mixin";
import Mixin from "@ember/object/mixin";
import { computed } from "@ember/object";
import { inject as service } from "@ember/service";
import Configuration from "ember-simple-auth/configuration";
import config from "ember-simple-auth-oidc/config";
import getAbsoluteUrl from "ember-simple-auth-oidc/utils/absoluteUrl";
import v4 from "uuid/v4";
import { assert } from "@ember/debug";

const { host, clientId, authEndpoint, scope, loginHintName } = config;

export default Mixin.create(UnauthenticatedRouteMixin, {
  session: service(),
  router: service(),

  queryParams: {
    code: { refreshModel: false },
    state: { refreshModel: false }
  },

  redirectUri: computed(function() {
    let { protocol, host } = location;
    let route = this.authenticationRoute;
    if (!route)
      route = Configuration.authenticationRoute;
    let path = this.router.urlFor(Configuration.authenticationRoute);

    return `${protocol}//${host}${path}`;
  }),

  _redirectToUrl(url) {
    location.replace(url);
  },

  /**
   * Handle unauthenticated requests
   *
   * This handles two cases:
   *
   * 1. The URL contains an authentication code and a state. In this case the
   *    client will try to authenticate with the given parameters.
   *
   * 2. The URL does not contain an authentication. In this case the client
   *    will be redirected to the configured identity provider login mask, which will
   *    then redirect to this route after a successful login.
   *
   * @param {*} model The model of the route
   * @param {Ember.Transition} transition The current transition
   * @param {Object} transition.to The destination of the transition
   * @param {Object} transition.to.queryParams The query params of the transition
   * @param {String} transition.to.queryParams.code The authentication code given by the identity provider
   * @param {String} transition.to.queryParams.state The state given by the identity provider
   */
  async afterModel(_, transition) {
    if (!authEndpoint) {
      throw new Error(
        "Please define all OIDC endpoints (auth, token, logout, userinfo)"
      );
    }

    const queryParams = transition.to
      ? transition.to.queryParams
      : transition.queryParams;

    if (queryParams.code) {
      return await this._handleCallbackRequest(
        queryParams.code,
        queryParams.state
      );
    }

    return this._handleRedirectRequest(queryParams);
  },

  /**
   * Authenticate with the authentication code given by the identity provider in the redirect.
   *
   * This will check if the passed state equals the state in the application to
   * prevent from CSRF attacks.
   *
   * If the authentication fails, it will redirect to this route again but
   * remove application state and query params. This is very unlikely to happen.
   *
   * If the authentication succeeds the default behaviour of ember-simple-auth
   * will apply and redirect to the entry point of the authenticated part of
   * the application.
   *
   * @param {String} code The authentication code passed by the identity provider
   * @param {String} state The state (uuid4) passed by the identity provider
   */
  async _handleCallbackRequest(code, state) {
    if (state !== this.get("session.data.state")) {
      assert("State did not match");
    }

    this.session.set("data.state", undefined);

    await this.session.authenticate("authenticator:oidc", {
      code
    });
  },

  /**
   * Redirect the client to the configured identity provider login.
   *
   * This will also generate a uuid4 state which the application stores to the
   * local storage. When authenticating, the state passed by the identity provider needs to
   * match this state, otherwise the authentication will fail to prevent from
   * CSRF attacks.
   */
  _handleRedirectRequest(queryParams) {
    let state = v4();

    this.session.set("data.state", state);
    /**
     * Store the attemptedTransition URL in the localstorage so when the user returns after
     * the login he can be sent to the initial destination.
     */
    this.session.set(
      "data.continueTransition",
      this.session.get("attemptedTransition.intent.url")
    );

    // forward `login_hint` query param if present
    const key = loginHintName || "login_hint";
    const forwarded = queryParams[key] ? `&${key}=${queryParams[key]}` : "";

    this._redirectToUrl(
      `${getAbsoluteUrl(host)}${authEndpoint}?` +
        `client_id=${clientId}&` +
        `redirect_uri=${this.redirectUri}&` +
        `response_type=code&` +
        `state=${state}&` +
        `scope=${scope}` +
        forwarded
    );
  }
});

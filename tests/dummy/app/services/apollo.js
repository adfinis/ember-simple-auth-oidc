import { inject as service } from "@ember/service";
import ApolloService from "ember-apollo-client/services/apollo";
import { apolloMiddleware } from "ember-simple-auth-oidc";

export default class CustomApolloService extends ApolloService {
  @service session;

  link() {
    const httpLink = super.link();

    return apolloMiddleware(httpLink, this.session);
  }
}

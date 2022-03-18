import Route from "@ember/routing/route";
import { queryManager } from "ember-apollo-client";
import { gql } from "graphql-tag";

export default class ApolloRoute extends Route {
  @queryManager apollo;

  model() {
    return this.apollo.watchQuery({
      query: gql`
        query {
          items {
            id
            name
          }
        }
      `,
    });
  }
}

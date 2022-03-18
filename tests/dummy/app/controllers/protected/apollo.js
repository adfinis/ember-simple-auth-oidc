import Controller from "@ember/controller";
import { action } from "@ember/object";
import { queryManager } from "ember-apollo-client";
import { gql } from "graphql-tag";

export default class ApolloController extends Controller {
  @queryManager apollo;

  @action
  triggerUnauthenticated(e) {
    this.apollo.mutate({
      mutation: gql`
        mutation {
          mutate {
            clientMutationId
          }
        }
      `,
    });

    e.preventDefault();
  }
}

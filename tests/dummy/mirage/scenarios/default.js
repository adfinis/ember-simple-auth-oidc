export default function (server) {
  /*
    Seed your development database using your factories.
    This data will not be loaded in your tests.
  */

  server.create("user", { username: "user1", email: "user1@example.com" });
  server.create("user", { username: "user2", email: "user2@example.com" });
}

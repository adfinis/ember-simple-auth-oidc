export default function (server) {
  server.create("user", { username: "user1", email: "user1@example.com" });
  server.create("user", { username: "user2", email: "user2@example.com" });
}

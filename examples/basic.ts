import { Client } from "../discord/mod.ts";

const client = new Client(Deno.env.get("DISCORD_TOKEN"));

client.on(
  "DM_MESSAGE_CREATE",
  (message) => {
    if (message.content === "ping") {
      client.reply(message, "pong!");
    }
  },
  { type: "dm" }
);

client.on(
  "GUILD_MESSAGE_CREATE",
  (message) => {
    if (message.content == "pong") {
      client.reply(message, "ping!");
    }
  },
  { type: "guild" }
);

client.on("MESSAGE_CREATE", (message) => {
  if (message.content == "foo") {
    client.reply(message, "bar!");
  }
});

client.on("READY", () => {
  console.log(
    `Logged in as ${client.user.username}#${client.user.discriminator}`
  );
});

client.start();

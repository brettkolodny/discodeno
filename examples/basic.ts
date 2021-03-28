import { Client } from "../discord/mod.ts";

const client = new Client(Deno.env.get("DISCORD_TOKEN"));

client.on("DM_MESSAGE_CREATE", (message) => {
  if (message.content === "ping") {
    client.reply(message, "pong");
  }
});

client.on("GUILD_MESSAGE_CREATE", (message) => {
  if (message.content == "foo") {
    client.send(message.channel_id, "bar");
  }
});

client.on("MESSAGE_CREATE", (message) => {
  if (message.content == "fizz") {
    client.react(message, "🐝");
  }
});

client.on("READY", () => {
  console.log(
    `Logged in as ${client.user.username}#${client.user.discriminator}`,
  );
});

client.start();

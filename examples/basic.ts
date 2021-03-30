import { Client, Embed } from "../src/mod.ts";

const client = new Client(Deno.env.get("DISCORD_TOKEN"));

/**
 * Execute the callback on the MESSAGE_CREATE event only if the message was
 * sent in a DM channel.
 */
client.on("DM_MESSAGE_CREATE", (message) => {
  if (message.content === "ping") {
    client.message.reply(message, "pong");
  }
});

/**
 * Execute the callback on the MESSAGE_CREATE event only if the message was
 * sent in a Guild channel.
 */
client.on("GUILD_MESSAGE_CREATE", (message) => {
  if (message.content == "foo") {
    client.message.send(message.channel_id, "bar");
  }
});

/**
 * Execute the callback on the MESSAGE_CREATE event regardless of whether
 * the message was sent in a DM or Guild channel.
 */
client.on("MESSAGE_CREATE", (message) => {
  if (message.content == "fizz") {
    client.reaction.add(message, "🐝");
  }
});

client.on("READY", () => {
  console.log(
    `Logged in as ${client.user.username}#${client.user.discriminator}`,
  );
});

client.start();

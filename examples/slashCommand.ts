import { Client } from "../discord/mod.ts";

const client = new Client(Deno.env.get("DISCORD_TOKEN"));

client.command.create({
  "name": "ping",
  "description": "A slash command",
});

client.command.on("ping", (command) => {
  client.command.respond(command, "pong!");
});

client.on("READY", () => {
  console.log(
    `Logged in as ${client.user.username}#${client.user.discriminator}`,
  );
});

client.start();

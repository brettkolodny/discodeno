import { types as DiscordTypes, Client } from "../mod.ts";

const client = new Client(Deno.env.get("DISCORD_TOKEN"));

const pingPong: DiscordTypes.ApplicationCommand = {
  name: "ping",
  description: "A slash command",
};

client.command.create(pingPong);

client.command.on("ping", (command) => {
  client.command.respond(command, "pong!");
});

client.on("READY", () => {
  console.log(
    `Logged in as ${client.bot.username}#${client.bot.discriminator}`,
  );
});

client.start();

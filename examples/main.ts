import { Client } from "../discord/mod.ts";

const client = new Client(
  "your token here",
);

client.on("message", (message) => {
  if (message.content === "ping") {
    client.reply(message, "pong!");
  }
});

client.on("ready", () => {
  console.log("ready");
});

client.start();

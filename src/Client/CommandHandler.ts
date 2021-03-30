import { AbstractHandler } from "./AbstractHandler.ts";
import { ApplicationCommand } from "../ApplicationCommand.d.ts";
import { Interaction } from "../Interaction.d.ts";

export class CommandHandler extends AbstractHandler {
  private commands: ApplicationCommand[];
  private eventCallbacks: Map<string, (data: any) => void>;

  constructor(
    token: string,
    incrSequence: () => number,
    callbacks: Map<string, (data: any) => void>,
    commands: ApplicationCommand[],
  ) {
    super(token, incrSequence);
    this.eventCallbacks = callbacks;
    this.commands = commands;
  }

  /**
   * Creates a slash command registered to the client.
   * @param command : The command to create
   */
  public create(command: ApplicationCommand) {
    this.commands.push(command);
  }

  /**
   * Define the client's behavior in response to a specific slash command. 
   * @param commandName : The name of the command to respond to.
   * @param callback : The function to call in response to the command.
   */
  public on(
    commandName: string,
    callback: (command: Interaction) => void,
  ) {
    this.eventCallbacks.set(commandName, callback);
  }

  public respond(command: Interaction, content: string) {
    fetch(
      `https://discord.com/api/v8/interactions/${command.id}/${command.token}/callback`,
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "type": 4,
          "data": {
            "content": content,
          },
        }),
      },
    );
  }
}

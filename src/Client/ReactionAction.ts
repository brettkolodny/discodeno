import { AbstractAction } from "./AbstractAction.ts";
import { Message } from "../Message.d.ts";

export class ReactionAction extends AbstractAction {
  /**
   * 
   * @param message: The message to add the reaction to
   * @param emoji: The emoji to be used in the reaction
   */
  public add(message: Message, emoji: string): void {
    fetch(
      `https://discord.com/api/v8/channels/${message.channel_id}/messages/${message.id}/reactions/${emoji}/@me`,
      {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    );
  }
}

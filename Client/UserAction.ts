import { AbstractAction } from "./AbstractAction.ts";
import { Channel } from "../types/Channel.d.ts";

export class UserAction extends AbstractAction {
  async createDM(userId: string): Promise<Channel | null> {
    const response = await fetch(
      `https://discord.com/api/v9/users/@me/channels`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_id: userId,
        }),
      },
    );

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  }
}

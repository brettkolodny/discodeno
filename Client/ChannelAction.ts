import { AbstractAction } from "./AbstractAction.ts";
import { Message } from "../types/Message.d.ts";
import { Channel } from "../types/Channel.d.ts";

export class ChannelAction extends AbstractAction {
  async get(channelId: string): Promise<Channel | null> {
    const response = await fetch(
      `https://discord.com/api/v9/channels/${channelId}`,
      {
        headers: {
          Authorization: `Bot ${this.token}`,
        },
      },
    );

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  }

  delete(channelId: string) {
    fetch(`https://discord.com/api/v9/channels/${channelId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${this.token}`,
      },
    });
  }

  async getMessages(channelId: string): Promise<Message[] | null> {
    const response = await fetch(
      `https://discord.com/api/v9/channels/${channelId}/messages`,
      {
        headers: {
          Authorization: `Bot ${this.token}`,
        },
      },
    );

    if (response.ok) {
      return await response.json();
    } else {
      return null;
    }
  }
}

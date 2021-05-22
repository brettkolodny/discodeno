import { AbstractAction } from "./AbstractAction.ts";

export class ChannelAction extends AbstractAction {
  delete(channelId: string) {
    fetch(`https://discord.com/api/v9/channels/${channelId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bot ${this.token}`,
      },
    });
  }
}

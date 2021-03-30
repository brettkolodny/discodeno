import { Message } from "../Message.d.ts";
import { AbstractAction } from "./AbstractAction.ts";

export class MessageAction extends AbstractAction {
  /**
   * Send a message to a channel.
   * @param channelId : The channel to send the message in
   * @param content : The content of the message
   */
  public send(channelId: string, content: string) {
    fetch(
      `https://discord.com/api/v8/channels/${channelId}/messages`,
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
          content: content,
          tts: false,
          nonce: this.incrSequence(),
        }),
      },
    );
  }

  /**
   * Reply to a message.
   * @param message : The message to reply to
   * @param content : The content of the reply
   */
  public reply(message: Message, content: string) {
    fetch(
      `https://discord.com/api/v8/channels/${message.channel_id}/messages`,
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
          content: content,
          tts: false,
          nonce: this.incrSequence(),
          message_reference: {
            message_id: message.id,
            channel_id: message.channel_id,
          },
        }),
      },
    ).catch((reason) => console.log(reason));
  }

  /**
   * Delete a message.
   * @param message : The message to delete
   */
  public delete(message: Message) {
    fetch(
      `https://discord.com/api/v8/channels/${message.channel_id}/messages/${message.id}`,
      {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    ).catch((reason) => console.log(reason));
  }

  /**
   * Edit a message.
   * @param message : The message to edit
   * @param content : The new contents of the message
   */
  public edit(message: Message, content: string) {
    fetch(
      `https://discord.com/api/v8/channels/${message.channel_id}/messages/${message.id}`,
      {
        method: "PATCH",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content,
        }),
      },
    ).then((res) => console.log(res)).catch((reason) => console.log(reason));
  }
}

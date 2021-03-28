// deno-lint-ignore-file
import { Message, MessageDelete, MessageDeleteBulk } from "./Message.d.ts";
import { ReactionAdd, ReactionRemove } from "./Reaction.d.ts";
import { TypingStart } from "./TypingStart.d.ts";
import { User } from "./User.d.ts";
import { Embed } from "./Embed.d.ts";

interface Intents {
  GUILDS: [boolean, number];
  GUILD_MEMBERS: [boolean, number];
  GUILD_BANS: [boolean, number];
  GUILD_EMOJIS: [boolean, number];
  GUILD_INTEGRATIONS: [boolean, number];
  GUILD_WEBHOOKS: [boolean, number];
  GUILD_INVITES: [boolean, number];
  GUILD_VOICE_STATES: [boolean, number];
  GUILD_PRESENCES: [boolean, number];
  GUILD_MESSAGES: [boolean, number];
  GUILD_MESSAGE_REACTIONS: [boolean, number];
  GUILD_MESSAGE_TYPING: [boolean, number];
  DIRECT_MESSAGES: [boolean, number];
  DIRECT_MESSAGE_REACTIONS: [boolean, number];
  DIRECT_MESSAGE_TYPING: [boolean, number];
}

export class Client {
  private token: string;
  private sequenceNumber = 0;
  private sessionId = 0;
  private socket!: WebSocket;
  user!: User;
  private heartbeatInterval!: number;
  private eventCallbacks: Map<string, (data: any) => void> = new Map();

  private intents: Intents = {
    GUILDS: [false, 1 << 0],
    GUILD_MEMBERS: [false, 1 << 1],
    GUILD_BANS: [false, 1 << 2],
    GUILD_EMOJIS: [false, 1 << 3],
    GUILD_INTEGRATIONS: [false, 1 << 4],
    GUILD_WEBHOOKS: [false, 1 << 5],
    GUILD_INVITES: [false, 1 << 6],
    GUILD_VOICE_STATES: [false, 1 << 7],
    GUILD_PRESENCES: [false, 1 << 8],
    GUILD_MESSAGES: [false, 1 << 9],
    GUILD_MESSAGE_REACTIONS: [false, 1 << 10],
    GUILD_MESSAGE_TYPING: [false, 1 << 11],
    DIRECT_MESSAGES: [false, 1 << 12],
    DIRECT_MESSAGE_REACTIONS: [false, 1 << 13],
    DIRECT_MESSAGE_TYPING: [false, 1 << 14],
  };

  /**
   * Creates a new client for the given token.
   * @param token : The secret token of the bot account
   */
  constructor(token: string | undefined) {
    if (token) {
      this.token = token;
    } else {
      console.log("Invalid token");
      Deno.exit(1);
    }
  }

  private markIntent(event: string): void {
    switch (event) {
      case "GUILD_CREATE":
      case "GUILD_UPDATE":
      case "GUILD_DELETE":
      case "GUILD_ROLE_CREATE":
      case "GUILD_ROLE_UPDATE":
      case "GUILD_ROLE_DELETE":
      case "CHANNEL_CREATE":
      case "CHANNEL_UPDATE":
      case "CHANNEL_DELETE":
      case "CHANNEL_PINS_UPDATE":
        this.intents.GUILDS[0] = true;
        break;
      case "GUILD_MEMBER_ADD":
      case "GUILD_MEMBER_UPDATE":
      case "GUILD_MEMBER_REMOVE":
        this.intents.GUILD_MEMBERS[0] = true;
        break;
      case "GUILD_BAN_ADD":
      case "GUILD_BAN_REMOVE":
        this.intents.GUILD_BANS[0] = true;
        break;
      case "GUILD_EMOJIS_UPDATE":
        this.intents.GUILD_EMOJIS[0] = true;
        break;
      case "GUILD_INTEGRATIONS_UPDATE":
        this.intents.GUILD_INTEGRATIONS[0] = true;
        break;
      case "WEBHOOKS_UPDATE":
        this.intents.GUILD_WEBHOOKS[0] = true;
        break;
      case "INVITE_CREATE":
      case "INVITE_DELETE":
        this.intents.GUILD_INVITES[0] = true;
        break;
      case "VOICE_STATE_UPDATE":
        this.intents.GUILD_VOICE_STATES[0] = true;
        break;
      case "PRESENCE_UPDATE":
        this.intents.GUILD_PRESENCES[0] = true;
        break;
      case "MESSAGE_CREATE":
      case "MESSAGE_UPDATE":
      case "MESSAGE_DELETE":
      case "MESSAGE_DELETE_BULK":
        this.intents.GUILD_MESSAGES[0] = true;
        this.intents.DIRECT_MESSAGES[0] = true;
        break;
      case "GUILD_MESSAGE_CREATE":
      case "GUILD_MESSAGE_UPDATE":
      case "GUILD_MESSAGE_DELETE":
      case "GUILD_MESSAGE_DELETE_BULK":
        this.intents.GUILD_MESSAGES[0] = true;
        break;
      case "DM_MESSAGE_CREATE":
      case "DM_MESSAGE_UPDATE":
      case "DM_MESSAGE_DELETE":
      case "DM_MESSAGE_DELETE_BULK":
        this.intents.DIRECT_MESSAGES[0] = true;
        break;
      case "MESSAGE_REACTION_ADD":
      case "MESSAGE_REACTION_REMOVE":
      case "MESSAGE_REACTION_REMOVE_ALL":
      case "MESSAGE_REACTION_REMOVE_EMOJI":
        this.intents.GUILD_MESSAGE_REACTIONS[0] = true;
        this.intents.DIRECT_MESSAGE_REACTIONS[0] = true;
        break;
      case "GUILD_MESSAGE_REACTION_ADD":
      case "GUILD_MESSAGE_REACTION_REMOVE":
      case "GUILD_MESSAGE_REACTION_REMOVE_ALL":
      case "GUILD_MESSAGE_REACTION_REMOVE_EMOJI":
        this.intents.GUILD_MESSAGE_REACTIONS[0] = true;
        break;
      case "DM_MESSAGE_REACTION_ADD":
      case "DM_MESSAGE_REACTION_REMOVE":
      case "DM_MESSAGE_REACTION_REMOVE_ALL":
      case "DM_MESSAGE_REACTION_REMOVE_EMOJI":
        this.intents.DIRECT_MESSAGE_REACTIONS[0] = true;
        break;
      case "TYPING_START":
        this.intents.GUILD_MESSAGE_TYPING[0] = true;
        this.intents.DIRECT_MESSAGE_TYPING[0] = true;
        break;
      case "GUILD_TYPING_START":
        this.intents.GUILD_MESSAGE_TYPING[0] = true;
        break;
      case "DM_TYPING_START":
        this.intents.DIRECT_MESSAGE_TYPING[0] = true;
        break;
      default:
        break;
    }
  }

  public on(
    event: "MESSAGE_CREATE" | "DM_MESSAGE_CREATE" | "GUILD_MESSAGE_CREATE",
    callback: (message: Message) => void,
  ): void;

  public on(
    event: "MESSAGE_UPDATE" | "DM_MESSAGE_UPDATE" | "GUILD_MESSAGE_UPDATE",
    callback: (message: Message) => void,
  ): void;

  public on(
    event: "MESSAGE_DELETE" | "DM_MESSAGE_DELETE" | "GUILD_MESSAGE_DELETE",
    callback: (msgDelete: MessageDelete) => void,
  ): void;

  public on(
    event:
      | "MESSAGE_DELETE_BULK"
      | "DM_MESSAGE_DELETE_BULK"
      | "GUILD_MESSAGE_DELETE_BULK",
    callback: (bulkDelete: MessageDeleteBulk) => void,
  ): void;

  public on(
    event: "DM_TYPING_START" | "GUILD_TYPING_START",
    callback: (typing: TypingStart) => void,
  ): void;

  public on(
    event:
      | "MESSAGE_REACTION_ADD"
      | "DM_MESSAGE_REACTION_ADD"
      | "GUILD_MESSAGE_REACTION_ADD",
    callback: (reactionAdd: ReactionAdd) => void,
  ): void;

  public on(
    event:
      | "MESSAGE_REACTION_REMOVE"
      | "DM_MESSAGE_REACTION_REMOVE"
      | "GUILD_MESSAGE_REACTION_REMOVE",
    callback: (reactionAdd: ReactionRemove) => void,
  ): void;

  public on(event: "READY", callback: () => void): void;

  /**
   * Define the client's behavior on specific events.
   * @param event : The event that will trigger the callback
   * @param callback : The callback to be run when the given event is triggered
   */
  public on(event: string, callback: (data: any) => void) {
    this.markIntent(event);
    this.eventCallbacks.set(event, callback);
  }

  public message = {
    /**
     * Send a message to a channel.
     * @param channelId : The channel to send the message in
     * @param content : The content of the message
     */
    send: (channelId: string, content: string) => {
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
            nonce: this.sequenceNumber++,
          }),
        },
      );
    },
    /**
     * Reply to a message.
     * @param message : The message to reply to
     * @param content : The content of the reply
     */
    reply: (message: Message, content: string) => {
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
            nonce: this.sequenceNumber++,
            message_reference: {
              message_id: message.id,
              channel_id: message.channel_id,
            },
          }),
        },
      ).catch((reason) => console.log(reason));
    },
    /**
     * Delete a message.
     * @param message : The message to delete
     */
    delete: (message: Message) => {
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
    },
    /**
     * Edit a message.
     * @param message The message to edit
     * @param content The new contents of the message
     */
    edit: (message: Message, content: string) => {
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
    },
  };

  public reaction = {
    /**
     * 
     * @param message: The message to add the reaction to
     * @param emoji: The emoji to be used in the reaction
     */
    add: (message: Message, emoji: string): void => {
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
    },
  };

  private heartbeat() {
    if (this.socket.readyState == WebSocket.CLOSED) {
      setTimeout(() => {
        this.heartbeat();
      }, this.heartbeatInterval);
    }

    const payload = {
      op: 1,
      d: {},
      s: this.sequenceNumber++,
      t: "HEARTBEAT",
    };

    this.socket.send(JSON.stringify(payload));

    setTimeout(() => {
      this.heartbeat();
    }, this.heartbeatInterval);
  }

  /**
   * Starts the client with the intents generated by the registered `on` events.
   * This should be called after all event callbacks have been defined for the bot.
   */
  async start() {
    this.user = await (
      await fetch("https://discord.com/api/v8/users/@me", {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
      })
    ).json();

    const { url } = await (
      await fetch("https://www.discord.com/api/v8/gateway")
    ).json();

    if (!url) {
      console.log("Error retrieving websocket connection");
      Deno.exit(1);
    }

    const wsURL = `${url}/?v=8&encoding=json`;

    this.socket = new WebSocket(wsURL);

    let intentNumber = 0;

    for (const [using, number] of Object.values(this.intents)) {
      if (using) intentNumber += number;
    }

    const identify = {
      op: 2,
      d: {
        token: this.token,
        intents: intentNumber,
        properties: {
          $browser: "disco",
          $device: "computer",
          $library: "notif",
        },
      },
      s: this.sequenceNumber++,
      t: "IDENTIFY",
    };

    this.socket.addEventListener("open", (e) => {
      if (this.sessionId) {
        return;
      } else {
        this.socket.send(JSON.stringify(identify));
      }
    });

    this.socket.addEventListener("close", (_reason) => {
      this.start();
    });

    this.socket.addEventListener("error", (error) => {
      console.log(error);
      Deno.exit(1);
    });

    this.socket.addEventListener("message", (message) => {
      const { op, t, d } = JSON.parse(message.data);
      if (op == 10) {
        this.heartbeatInterval = d["heartbeat_interval"];
        this.heartbeat();
      } else if (op == 7) {
        return;
      } else if (op == 0) {
        if (t == "READY") {
          this.sessionId = d["session_id"];
        }

        const callback = this.eventCallbacks.get(t);

        if (callback) callback(d);

        let data!: Message | TypingStart;

        if (t.startsWith("MESSAGE")) {
          data = d as Message;
        } else if (t.startsWith("TYPING")) {
          data = d as TypingStart;
        }

        if (data && data.member) {
          const guildCallback = this.eventCallbacks.get("GUILD_" + t);
          if (guildCallback) guildCallback(d);
        } else {
          const dmCallback = this.eventCallbacks.get("DM_" + t);
          if (dmCallback) dmCallback(d);
        }
      }
    });
  }
}

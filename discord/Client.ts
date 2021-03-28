// deno-lint-ignore-file
import { Message, MessageDelete, MessageDeleteBulk } from "./Message.d.ts";
import { ReactionAdd, ReactionRemove } from "./Reaction.d.ts";
import { TypingStart } from "./TypingStart.d.ts";
import { User } from "./User.d.ts";
import { Emoji } from "./Emoji.d.ts";

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

  constructor(token: string | undefined) {
    if (token) {
      this.token = token;
    } else {
      console.log("Invalid token");
      Deno.exit(1);
    }
  }

  private markIntent(event: string): void {
    if (
      event == "GUILD_CREATE" ||
      event == "GUILD_UPDATE" ||
      event == "GUILD_DELETE" ||
      event == "GUILD_ROLE_CREATE" ||
      event == "GUILD_ROLE_UPDATE" ||
      event == "GUILD_ROLE_DELETE" ||
      event == "CHANNEL_CREATE" ||
      event == "CHANNEL_UPDATE" ||
      event == "CHANNEL_DELETE" ||
      event == "CHANNEL_PINS_UPDATE"
    ) {
      this.intents.GUILDS[0] = true;
    } else if (
      event == "GUILD_MEMBER_ADD" ||
      event == "GUILD_MEMBER_UPDATE" ||
      event == "GUILD_MEMBER_REMOVE"
    ) {
      this.intents.GUILD_MEMBERS[0] = true;
    } else if (event == "GUILD_BAN_ADD" || event == "GUILD_BAN_REMOVE") {
      this.intents.GUILD_BANS[0] = true;
    } else if (event == "GUILD_EMOJIS_UPDATE") {
      this.intents.GUILD_EMOJIS[0] = true;
    } else if (event == "GUILD_INTEGRATIONS_UPDATE") {
      this.intents.GUILD_INTEGRATIONS[0] = true;
    } else if (event == "WEBHOOKS_UPDATE") {
      this.intents.GUILD_WEBHOOKS[0] = true;
    } else if (event == "INVITE_CREATE" || event == "INVITE_DELETE") {
      this.intents.GUILD_INVITES[0] = true;
    } else if (event == "VOICE_STATE_UPDATE") {
      this.intents.GUILD_VOICE_STATES[0] = true;
    } else if (event == "PRESENCE_UPDATE") {
      this.intents.GUILD_PRESENCES[0] = true;
    } else if (
      event == "MESSAGE_CREATE" ||
      event == "MESSAGE_UPDATE" ||
      event == "MESSAGE_DELETE" ||
      event == "MESSAGE_DELETE_BULK"
    ) {
      this.intents.GUILD_MESSAGES[0] = true;
      this.intents.DIRECT_MESSAGES[0] = true;
    } else if (
      event == "GUILD_MESSAGE_CREATE" ||
      event == "GUILD_MESSAGE_UPDATE" ||
      event == "GUILD_MESSAGE_DELETE" ||
      event == "GUILD_MESSAGE_DELETE_BULK"
    ) {
      this.intents.GUILD_MESSAGES[0] = true;
    } else if (
      event == "DM_MESSAGE_CREATE" ||
      event == "DM_MESSAGE_UPDATE" ||
      event == "DM_MESSAGE_DELETE" ||
      event == "DM_MESSAGE_DELETE_BULK"
    ) {
      this.intents.DIRECT_MESSAGES[0] = true;
    } else if (
      event == "MESSAGE_REACTION_ADD" ||
      event == "MESSAGE_REACTION_REMOVE" ||
      event == "MESSAGE_REACTION_REMOVE_ALL" ||
      event == "MESSAGE_REACTION_REMOVE_EMOJI"
    ) {
      this.intents.GUILD_MESSAGE_REACTIONS[0] = true;
      this.intents.DIRECT_MESSAGE_REACTIONS[0] = true;
    } else if (
      event == "GUILD_MESSAGE_REACTION_ADD" ||
      event == "GUILD_MESSAGE_REACTION_REMOVE" ||
      event == "GUILD_MESSAGE_REACTION_REMOVE_ALL" ||
      event == "GUILD_MESSAGE_REACTION_REMOVE_EMOJI"
    ) {
      this.intents.GUILD_MESSAGE_REACTIONS[0] = true;
    } else if (
      event == "DM_MESSAGE_REACTION_ADD" ||
      event == "DM_MESSAGE_REACTION_REMOVE" ||
      event == "DM_MESSAGE_REACTION_REMOVE_ALL" ||
      event == "DM_MESSAGE_REACTION_REMOVE_EMOJI"
    ) {
      this.intents.DIRECT_MESSAGE_REACTIONS[0] = true;
    } else if (event == "TYPING_START") {
      this.intents.GUILD_MESSAGE_TYPING[0] = true;
      this.intents.DIRECT_MESSAGE_TYPING[0] = true;
    } else if (event == "GUILD_TYPING_START") {
      this.intents.GUILD_MESSAGE_TYPING[0] = true;
    } else if (event == "DM_TYPING_START") {
      this.intents.DIRECT_MESSAGE_TYPING[0] = true;
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

  public on(event: string, callback: (data: any) => void) {
    this.markIntent(event);
    this.eventCallbacks.set(event, callback);
  }

  public send(channelId: string, content: string): void {
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
  }

  public reply(message: Message, content: string): void {
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
  }

  public react(message: Message, emoji: string): void {
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

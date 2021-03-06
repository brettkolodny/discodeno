import { MessageAction } from "./MessageAction.ts";
import { ReactionAction } from "./ReactionAction.ts";
import { CommandAction } from "./CommandAction.ts";
import { GuildAction } from "./GuildAction.ts";
import { ChannelAction } from "./ChannelAction.ts";
import { UserAction } from "./UserAction.ts";
import {
  ApplicationCommand,
  Interaction,
  Message,
  MessageDelete,
  MessageDeleteBulk,
  ReactionAdd,
  ReactionRemove,
  TypingStart,
  User,
} from "../types/mod.ts";

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

interface IdentifyPayload {
  op: number;
  d: {
    token: string;
    intents: number;
    properties: {
      $browser: string;
      $device: string;
      $library: string;
    };
  };
  s: number;
  t: string;
}

export class Client {
  private token: string;
  private sequenceNumber = 0;
  private sessionId = 0;
  private socket!: WebSocket;
  private heartbeatInterval!: number;
  // deno-lint-ignore no-explicit-any
  private eventCallbacks: Map<string, (data: any) => void> = new Map();
  private commands: ApplicationCommand[] = [];
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

  public message: MessageAction;
  public reaction: ReactionAction;
  public command: CommandAction;
  public guild: GuildAction;
  public channel: ChannelAction;
  public user: UserAction;

  /**
   * The user information of the client.
   */
  public bot!: User;

  /**
   * Creates a new client for the given token.
   * @param token : The secret token of the bot account
   */
  constructor(token: string | undefined) {
    if (!token) {
      console.log("Invalid token");
      Deno.exit(1);
    }

    this.token = token;

    const sequenceInc = () => {
      return this.sequenceNumber++;
    };

    this.message = new MessageAction(token, sequenceInc);
    this.reaction = new ReactionAction(token, sequenceInc);
    this.channel = new ChannelAction(token, sequenceInc);
    this.user = new UserAction(token, sequenceInc);
    this.command = new CommandAction(
      token,
      sequenceInc,
      this.eventCallbacks,
      this.commands,
    );
    this.guild = new GuildAction(token, sequenceInc);
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
   * @param event The event that will trigger the callback
   * @param callback The callback to be run when the given event is triggered
   */
  // deno-lint-ignore no-explicit-any
  public on(event: string, callback: (data: any) => void) {
    this.markIntent(event);
    this.eventCallbacks.set(event, callback);
  }

  private getIdentifyPayload(): IdentifyPayload {
    let intentNumber = 0;

    for (const [using, number] of Object.values(this.intents)) {
      if (using) intentNumber += number;
    }

    const identify: IdentifyPayload = {
      op: 2,
      d: {
        token: this.token,
        intents: intentNumber,
        properties: {
          $browser: "disco",
          $device: "computer",
          $library: "discodeno",
        },
      },
      s: this.sequenceNumber++,
      t: "IDENTIFY",
    };

    return identify;
  }

  /**
   * Starts the client with the intents generated by the registered `on` events.
   * This should be called after all event callbacks have been defined for the bot.
   */
  async start() {
    this.bot = await (
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

    await this.clearCommands();
    await this.createCommands();

    const { url } = await (
      await fetch("https://www.discord.com/api/v8/gateway")
    ).json();

    if (!url) {
      console.log("Error retrieving websocket connection");
      Deno.exit(1);
    }

    const wsURL = `${url}/?v=8&encoding=json`;

    this.socket = new WebSocket(wsURL);

    this.socket.addEventListener("open", (e) => {
      if (this.sessionId) {
        this.resume();
      } else {
        this.socket.send(JSON.stringify(this.getIdentifyPayload()));
      }
    });

    this.socket.addEventListener("close", (_reason) => {
      this.start();
    });

    this.socket.addEventListener("error", (error) => {
      console.log(error);
      this.socket.close();
      this.start();
    });

    this.socket.addEventListener("message", (message) => {
      const { op, t, d } = JSON.parse(message.data);
      if (op == 10) {
        this.heartbeatInterval = d["heartbeat_interval"];
        setTimeout(() => this.heartbeat(), Math.random());
      } else if (op == 9) {
        setTimeout(() => {
          const identifyPayload = this.getIdentifyPayload();
          this.socket.send(JSON.stringify(identifyPayload));
        }, Math.random() * (5000 - 1000) + 1000);
      } else if (op == 7) {
        return;
      } else if (op == 1) {
        this.sendHeartbeat();
      } else if (op == 0) {
        if (t == "READY") {
          this.sessionId = d["session_id"];
        }

        let eventName = t;

        if (t == "INTERACTION_CREATE") {
          eventName = (d as Interaction).data.name;
        }

        const callback = this.eventCallbacks.get(eventName);

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

  private resume() {
    const payload = {
      op: 6,
      d: {
        token: this.token,
        session_id: this.sessionId,
        seq: this.sequenceNumber,
      },
    };

    this.socket.send(JSON.stringify(payload));
  }

  private heartbeat() {
    if (this.socket.readyState != WebSocket.OPEN) {
      setTimeout(() => {
        this.heartbeat();
      }, this.heartbeatInterval);
    }

    this.sendHeartbeat();

    setTimeout(() => {
      this.heartbeat();
    }, this.heartbeatInterval);
  }

  private sendHeartbeat() {
    const payload = {
      op: 1,
      d: {},
      s: this.sequenceNumber++,
      t: "HEARTBEAT",
    };

    this.socket.send(JSON.stringify(payload));
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

  private async clearCommands() {
    let commands = await (await fetch(
      `https://discord.com/api/v8/applications/${this.bot.id}/commands`,
      {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: {
          Authorization: `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
      },
    )).json();

    commands = commands as ApplicationCommand[];

    for (const command of commands) {
      if (
        this.commands.filter((value) => value.name === command.name).length
      ) {
        console.log("update");
        await fetch(
          `https://discord.com/api/v8/applications/${this.bot.id}/commands`,
          {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "omit",
            headers: {
              Authorization: `Bot ${this.token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(command),
          },
        );

        this.commands = this.commands.filter((value) =>
          value.name != command.name
        );
      } else {
        console.log("delete");
        await fetch(
          `https://discord.com/api/v8/applications/${this.bot.id}/commands/${command.id}`,
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
        );
      }
    }
  }

  private async createCommands() {
    for (const command of this.commands) {
      console.log("create");
      await fetch(
        `https://discord.com/api/v8/applications/${this.bot.id}/commands`,
        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "omit",
          headers: {
            Authorization: `Bot ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(command),
        },
      );
    }
  }
}

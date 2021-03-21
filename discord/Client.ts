// deno-lint-ignore-file
import { Message } from "./Message.d.ts";

export class Client {
  private token: string;
  private sequenceNumber = 0;
  private sessionId = 0;
  private socket!: WebSocket;
  id: string | undefined;
  private heartbeatInterval!: number;
  private eventCallbacks: Map<string, (data: any) => void> = new Map();

  constructor(token: string) {
    this.token = token;
  }

  public on(event: "message", callback: (message: Message) => void): void;

  public on(event: "dm-message", callback: (message: string) => void): void;

  public on(event: "ready", callback: () => void): void;

  public on(event: string, callback: (data: any) => void) {
    if (event == "message") {
      this.eventCallbacks.set("MESSAGE_CREATE", callback);
    } else if (event == "ready") {
      this.eventCallbacks.set("READY", callback);
    }
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
          "Authorization": `Bot ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "content": content,
          "tts": false,
          "nonce": this.sequenceNumber++,
        }),
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
    this.id = this.id
      ? this.id
      : (await (await fetch("https://discord.com/api/v8/users/@me", {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        headers: {
          Authorization: this.token,
          "Content-Type": "application/json",
        },
      })).json()).id;

    const { url } = await (await fetch(
      "https://www.discord.com/api/v8/gateway",
    )).json();

    if (!url) {
      console.log("Error retrieving websocket connection");
      Deno.exit(1);
    }

    const wsURL = `${url}/?v=8&encoding=json`;

    this.socket = new WebSocket(wsURL);

    const identify = {
      op: 2,
      d: {
        token: this.token,
        intents: 1 << 12,
        properties: {
          "$browser": "disco",
          "$device": "computer",
          "$library": "notif",
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
      }
    });
  }
}

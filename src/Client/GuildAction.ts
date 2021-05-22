import { AbstractAction } from "./AbstractAction.ts";
import { Guild } from "../types/Guild.d.ts";
import { ChannelType } from "../types/ChannelType.ts";

interface CreateChannelOptions {
  name: string;
  type: ChannelType;
  topic?: string;
  position?: number;
  parentId?: string;
  bitrate?: number;
  userLimit?: number;
  rateLimit?: number;
  nsfw?: boolean;
}

interface ModifyChannelPositionOptions {
  position?: number;
  lockPermissions?: boolean;
  parentId?: string;
}

export class GuildAction extends AbstractAction {
  async get(guildId: string): Promise<Guild | null> {
    const response = await fetch(
      `https://discord.com/api/v9/guilds/${guildId}`,
      {
        headers: {
          Authorization: `Bot ${this.token}`,
        },
      },
    );

    if (response.ok) {
      const guild: Guild = await response.json();
      return guild;
    } else {
      return null;
    }
  }

  async createChannel(guildId: string, options: CreateChannelOptions) {
    await fetch(`https://discord.com/api/v9/guilds/${guildId}/channels`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "omit",
      headers: {
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: options.name,
        type: options.type,
        topic: options.topic,
        rate_limit_per_user: options.rateLimit,
        user_limit: options.userLimit,
        position: options.position,
        parent_id: options.parentId,
        nsfw: options.nsfw,
        bitrate: options.bitrate,
      }),
    });
  }

  async modifyChannelPosition(
    guildId: string,
    channelId: string,
    options: ModifyChannelPositionOptions,
  ) {
    await fetch(`https://discord.com/api/v9/guilds/${guildId}/channels`, {
      method: "PATCH",
      mode: "cors",
      cache: "no-cache",
      credentials: "omit",
      headers: {
        Authorization: `Bot ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        id: channelId,
        position: options.position ? options.position : null,
        lock_permissions: options.lockPermissions
          ? options.lockPermissions
          : null,
        parent_id: options.parentId ? options.parentId : null,
      }]),
    }).then((value) => console.log(value));
  }
}

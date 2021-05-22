import { Emoji } from "./Emoji.d.ts";
import { GuildMember } from "./GuildMember.d.ts";

export interface Reaction {
  "count": number;
  "me": boolean;
  "emoji": Emoji;
}

export interface ReactionAdd {
  "user_id": string;
  "channel_id": string;
  "message_id": string;
  "guild_id"?: string;
  "member"?: GuildMember;
  "emoji": Emoji;
}

export interface ReactionAdd {
  "user_id": string;
  "channel_id": string;
  "message_id": string;
  "guild_id"?: string;
  "member"?: GuildMember;
  "emoji": Emoji;
}

export interface ReactionRemove {
  "user_id": string;
  "channel_id": string;
  "message_id": string;
  "guild_id"?: string;
  "emoji": Emoji;
}

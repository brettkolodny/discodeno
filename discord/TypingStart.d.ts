import { GuildMember } from "./GuildMember.d.ts";

export interface TypingStart {
  "channel_id": string;
  "guild_id"?: string;
  "user_id": string;
  "timestamp": number;
  "member"?: GuildMember;
}

import { User } from "./User.d.ts";

export interface GuildMember {
  "user"?: User;
  "nick"?: string;
  "roles": string[];
  "joined_at": number;
  "premium_since"?: number;
  "deaf": boolean;
  "mute": boolean;
  "pending"?: boolean;
  "permissions"?: string;
}

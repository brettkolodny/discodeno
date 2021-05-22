import { User } from "./User.d.ts";
import { GuildMember } from "./GuildMember.d.ts";
import { ChannelMention } from "./ChannelMention.d.ts";
import { Attachment } from "./Attachment.d.ts";
import { Embed } from "./Embed.d.ts";
import { Reaction } from "./Reaction.d.ts";

export interface Message {
  "id": string;
  "channel_id": string;
  "guild_id"?: string;
  "author": User;
  "member"?: GuildMember;
  "content": string;
  "timestamp": number;
  "edited_timestamp": number;
  "tts": boolean;
  "mention_everyone": boolean;
  "mentions": User[];
  "mention_roles": string[];
  "mention_channels": ChannelMention[];
  "attachments": Attachment[];
  "embeds": Embed[];
  "reactions"?: Reaction[];
  "nonce": number | string;
  "pinned": boolean;
  "webhook_id"?: string;
  "type": number;
  "activity": MessageActivity;
  "application"?: MessageApplication;
  "flags"?: number;
  "stickers": MessageSticker[];
  "referenced_message"?: Message;
  "interaction"?: MessageInteraction;
}

export interface MessageActivity {
  "type": number;
  "party_id"?: string;
}

export interface MessageApplication {
  "id": string;
  "cover_image"?: string;
  "description": string;
  "icon": string | null;
  "name": string;
}

export interface MessageSticker {
  "id": string;
  "pack_id": string;
  "name": string;
  "description": string;
  "tags"?: string;
  "asset": string;
  "preview_asset"?: string;
  "format_type": number;
}

declare enum Activity {
  JOIN = 0,
  SPECTATE,
  LISTEN,
  JOIN_REQUEST,
}

declare enum Interaction {
  PING = 1,
  ApplicationCommand,
}

export interface MessageInteraction {
  "id": string;
  "type": Interaction;
  "name": string;
  "user": User;
}

export interface MessageDelete {
  "id": string;
  "channel_id": string;
  "guild_id"?: string;
}

export interface MessageDeleteBulk {
  "ids": string[];
  "channel_id": string;
  "guild_id"?: string;
}

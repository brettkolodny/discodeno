import { User } from "./User.d.ts";
import { GuildMember } from "./GuildMember.d.ts";
import { ChannelMention } from "./ChannelMention.d.ts";
import { Attachment } from "./Attachment.d.ts";
import { Embed } from "./Embed.d.ts";

export interface Message {
  "id": string;
  "channel_id": string;
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
  //"reactions"?: Reaction[];
  "nonce": number | string;
  "pinned": boolean;
  "webhook_id"?: string;
  "type": number;
  //"activity": MessageActivity;
  //"application"?: MessageApplication;
  "flags"?: number;
  // "stickers": Sticker[];
  "referenced_message"?: Message;
  // "interaction"?: MessageInteraction;
}

// interface Reaction

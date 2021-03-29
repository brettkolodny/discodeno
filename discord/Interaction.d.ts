import { Embed } from "./Embed.d.ts";
import { GuildMember } from "./GuildMember.d.ts";
import { User } from "./User.d.ts";

export interface Interaction {
  "id": string;
  "type": InteractionType;
  "data": ApplicationCommandInteractionData;
  "guild_id?": string;
  "channel_id"?: string;
  "member"?: GuildMember;
  "user"?: User;
  "token": string;
  "version": number;
}

export interface ApplicationCommandInteractionData {
  "id": string;
  "name": string;
  "options"?: ApplicationCommandInteractionDataOption[];
}

export interface ApplicationCommandInteractionDataOption {
  "name": string;
  "value"?: string;
}

export interface InteractionResponse {
  "type": InteractionResponseType;
  "data"?: InteractionApplicationCommandCallbackData;
}

declare enum InteractionType {
  Ping = 1,
  ApplicationCommand,
}

declare enum InteractionResponseType {
  Pong = 1,
  Acknowledge,
  ChannelMessage,
  ChannelMessageWithSource,
  DeferredChannelMessageWithSource,
}

export interface InteractionApplicationCommandCallbackData {
  "tts"?: boolean;
  "content"?: string;
  "embeds"?: Embed[];
  "allowed_mentions"?: boolean;
  "flags"?: number;
}

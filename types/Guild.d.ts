import { Emoji } from "./Emoji.d.ts";
import { GuildMember } from "./GuildMember.d.ts";
import { Channel } from "./Channel.d.ts";
import { VoiceState } from "./VoiceState.d.ts";

export interface Guild {
  "id": string;
  "name": string;
  "icon": string | null;
  "icon_hash"?: string | null;
  "splash": string | null;
  "discovery_slash": string | null;
  "owner"?: boolean;
  "owner_id": string;
  "permissions"?: string;
  "region": string;
  "afk_channel_id": string | null;
  "afk_timeout": string;
  "widget_enabled"?: boolean;
  "widget_channel_id"?: string | null;
  "verification_level": VerificationLevel;
  "default_message_notification": DefaultMessageNotificationLevel;
  "explicit_content_filter": ExplicitContentFilterLevel;
  // "roles": Roles[];
  "emojis": Emoji[];
  // "features": GuildFeature[];
  "mfa_level": MFALevel;
  "application_id": string | null;
  "system_channel_id": string | null;
  "system_channel_flags": SystemChannelFlag;
  "rules_channel_id": string | null;
  "joined_at"?: number;
  "unavailable"?: boolean;
  "member_count"?: number;
  "voice_states"?: VoiceState[];
  "members"?: GuildMember[];
  "channels"?: Channel[];
  "threads"?: Channel[];
  // "presences"?: PresenseUpdate[];
  "max_presences"?: number | null;
  "max_members"?: number;
  "vanity_url_code": string | null;
  "description": string | null;
  "banner": string | null;
  "premium_tier": string;
  "premium_subscription_count"?: number;
  "preferred_locale": string;
  "public_updates_channel_id": string | null;
  "max_video_channel_users"?: number;
  "approximate_member_count"?: number;
  "approximate_presence_count"?: number;
  // "welcome_screen"?: WelcomeScreen;
  "nsfw": boolean;
}

declare enum VerificationLevel {
  NONE = 0,
  LOW,
  MEDIUM,
  HIGH,
  VERY_HIGH,
}

declare enum DefaultMessageNotificationLevel {
  ALL_MESSAGES = 0,
  ONLY_MENTIONS,
}

declare enum ExplicitContentFilterLevel {
  DISABLED = 0,
  MEMBERS_WITHOUT_ROLES,
  ALL_MEMBERS,
}

declare enum MFALevel {
  NONE = 0,
  ELEVATED,
}

declare enum SystemChannelFlag {
  SUPPRESS_JOIN_NOTIFICATIONS = 1 << 0,
  SUPPRESS_PREMIUM_SUBSCRIPTIONS = 1 << 1,
  SUPPRESS_GUILD_REMINDER_NOTIFICATIONS = 1 << 2,
}

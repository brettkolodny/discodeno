import { User } from "./User.d.ts";
import { ChannelType } from "./ChannelType.ts";

export interface Channel {
  "id": string;
  "type": ChannelType;
  "guild_id"?: string;
  "position"?: number;
  // "permission_overwrites"?: Overwrite;
  "name"?: string;
  "topic"?: string | null;
  "nsfw"?: boolean;
  "last_message_id"?: string | null;
  "bitrate"?: number;
  "user_limit"?: number;
  "rate_limit_per_user"?: number;
  "recipients"?: User[];
  "icon"?: string | null;
  "owner_id"?: string;
  "application_id"?: string;
  "parent_id"?: string | null;
  "last_pin_timestamp"?: string | null;
  "rtc_regin"?: string | null;
  "video_quality_mode"?: VideoQualityMode;
  "message_count"?: number;
  "member_count"?: number;
  // "thread_metadata"?: ThreadMetadata;
  // "member"?: ThreadMember;
}

declare enum VideoQualityMode {
  AUTO = 1,
  FULL,
}

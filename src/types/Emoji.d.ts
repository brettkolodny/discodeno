import { User } from "./User.d.ts";

export interface Emoji {
  "id": string;
  "name": string | null;
  "roles"?: number[];
  "user"?: User;
  "require_colons"?: boolean;
  "managed"?: boolean;
  "animated"?: boolean;
  "available"?: boolean;
}

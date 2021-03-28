import { Emoji } from "./Emoji.d.ts";

export interface Reaction {
  count: number;
  me: boolean;
  emoji: Emoji;
}

export interface ApplicationCommand {
  "id"?: string;
  "application_id"?: string;
  "name": string;
  "description": string;
  "options"?: ApplicationCommandOption[];
}

interface ApplicationCommandOption {
  "type": ApplicationCommandOptionType;
  "name": string;
  "description": string;
  "required"?: boolean;
  "choices"?: ApplicationCommandOptionChoice[];
  "options"?: ApplicationCommandOption[];
}

interface ApplicationCommandOptionChoice {
  "name": string;
  "value": string | number;
}

declare enum ApplicationCommandOptionType {
  SUB_COMMAND = 1,
  SUB_COMMAND_GROUP,
  STRING,
  INTEGER,
  BOOLEAN,
  USER,
  CHANNEL,
  ROLE,
}

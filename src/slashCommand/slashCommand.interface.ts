import {
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
export interface BaseCommand {
  name: string;
  slashCommandBuilder: RESTPostAPIApplicationCommandsJSONBody;

  handleCommand(arg: ChatInputCommandInteraction): Promise<void>;
}

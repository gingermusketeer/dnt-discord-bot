import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface BaseCommand {
  name: string;
  slashCommandBuilder:
    | SlashCommandBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;

  handleCommand(arg: ChatInputCommandInteraction): Promise<void>;
}

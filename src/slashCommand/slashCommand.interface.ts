import { SlashCommandBuilder } from 'discord.js';

export interface BaseCommand {
  slashCommandBuilder: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;
}

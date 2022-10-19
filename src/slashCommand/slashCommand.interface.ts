import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface BaseCommand {
  // TODO enforce static method implementation in commands with an abstract class?
  slashCommandBuilder: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;

  handleCommand(arg: ChatInputCommandInteraction): Promise<void>;
}

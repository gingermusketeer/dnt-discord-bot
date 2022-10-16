import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export default class PspspsCommand {
  public static slashCommandBuilder = new SlashCommandBuilder()
    .setName('pspsps')
    .setDescription('A purrrrfect surprise');

  public static async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.reply('Meow :)');
  }
}

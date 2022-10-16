import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export default class PingCommand {
  public static slashCommandBuilder = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!');

  public static async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.reply('Pong!');
  }
}

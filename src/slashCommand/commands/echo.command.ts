import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export default class EchoCommand {
  public static slashCommandBuilder = new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Replies with your input!')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('The input to echo back')
        .setRequired(true),
    )
    .setDMPermission(false);

  public static async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const message = interaction.options.getString('message', true);
    await interaction.reply(message);
  }
}

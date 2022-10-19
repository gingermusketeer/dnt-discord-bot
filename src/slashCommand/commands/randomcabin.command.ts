import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';

export default class RandomCabinCommand {
  public static slashCommandBuilder = new SlashCommandBuilder()
    .setName('randomcabin')
    .setDescription('Finds a random cabin available at your dates')
    .setDMPermission(true)
    .addStringOption((option) =>
      option
        .setName('check-in')
        .setDescription('When do you want to arrive (yyyy-mm-dd)?')
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName('check-out')
        .setDescription('When do you want to leave (yyyy-mm-dd)?')
        .setRequired(true),
    );

  public static async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const checkIn = interaction.options.getString('check-in', true);
    const checkOut = interaction.options.getString('check-out', true);
    await interaction.reply('Not quite there yet, but working on it!');
  }
}

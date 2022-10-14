import { SlashCommandBuilder } from 'discord.js';

export default class RandomCabinCommand {
  public static slashCommandBuilder = new SlashCommandBuilder()
    .setName('randomcabin')
    .setDescription('Finds a random cabin available at your dates')
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
}

import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('echo')
  .setDescription('Replies with your input!')
  .addStringOption((option) =>
    option
      .setName('message')
      .setDescription('The input to echo back')
      .setRequired(true),
  );

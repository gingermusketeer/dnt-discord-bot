import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('randomcabin')
  .setDescription('Replies with pong!')
  .addStringOption((option) =>
    option
      .setName('check-in')
      .setDescription('When do you want to arrive?')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('check-out')
      .setDescription('When do you want to leave?')
      .setRequired(true),
  );

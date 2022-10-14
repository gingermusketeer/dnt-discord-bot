import { SlashCommandBuilder } from 'discord.js';

export default class PingCommand {
  public static slashCommandBuilder = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with pong!');
}

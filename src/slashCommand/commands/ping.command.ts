import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from 'discord.js';
import { BaseCommand } from '../slashCommand.interface';

@Injectable()
export default class PingCommand implements BaseCommand {
  public readonly name: string;
  public readonly slashCommandBuilder: RESTPostAPIApplicationCommandsJSONBody;

  constructor() {
    this.name = 'ping';

    this.slashCommandBuilder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Replies with pong!')
      .toJSON();
  }

  public async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.reply('Pong!');
  }
}

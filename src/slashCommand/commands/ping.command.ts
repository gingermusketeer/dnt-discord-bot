import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { BaseCommand } from '../slashCommand.interface';

@Injectable()
export default class PingCommand implements BaseCommand {
  public readonly name: string;
  public readonly slashCommandBuilder: SlashCommandBuilder;

  constructor() {
    this.name = 'ping';

    this.slashCommandBuilder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('Replies with pong!');
  }

  public async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.reply('Pong!');
  }
}

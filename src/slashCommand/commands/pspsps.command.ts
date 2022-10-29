import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { BaseCommand } from '../slashCommand.interface';

@Injectable()
export default class PspspsCommand implements BaseCommand {
  public readonly name: string;
  public readonly slashCommandBuilder: SlashCommandBuilder;

  constructor() {
    this.name = 'pspsps';

    this.slashCommandBuilder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription('A purrrrfect surprise');
  }

  public async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.reply('Meow :)');
  }
}

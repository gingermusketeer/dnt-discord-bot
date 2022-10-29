import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import { BaseCommand } from '../slashCommand.interface';

@Injectable()
export default class RandomCabinCommand implements BaseCommand {
  public readonly name: string;
  public readonly slashCommandBuilder: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;

  constructor() {
    this.name = 'randomcabin';

    this.slashCommandBuilder = new SlashCommandBuilder()
      .setName(this.name)
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
  }

  // Defer response
  // https://discordjs.guide/interactions/slash-commands.html#editing-responses

  public async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const checkIn = interaction.options.getString('check-in', true);
    const checkOut = interaction.options.getString('check-out', true);
    await interaction.reply('Not quite there yet, but working on it!');
  }
}

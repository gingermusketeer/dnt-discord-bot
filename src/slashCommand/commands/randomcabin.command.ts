import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';
import { convert } from 'html-to-text';
import { CabinService } from 'src/cabin/cabin.service';
import { CabinSummary } from 'src/cabinDatabase/cabinDatabase.interface';
import { BaseCommand } from '../slashCommand.interface';

@Injectable()
export default class RandomCabinCommand implements BaseCommand {
  public readonly name: string;
  public readonly slashCommandBuilder: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;

  constructor(private readonly cabinService: CabinService) {
    this.name = 'randomcabin';

    this.slashCommandBuilder = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(
        'Get a random cabin. Optional: Provide dates to make sure it is available.',
      )
      .setDMPermission(true)
      .addStringOption((option) =>
        option
          .setName('check-in')
          .setDescription('When do you want to arrive (yyyy-mm-dd)?')
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName('check-out')
          .setDescription('When do you want to leave (yyyy-mm-dd)?')
          .setRequired(false),
      );
  }

  public async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const checkIn = interaction.options.getString('check-in', false);
    const checkOut = interaction.options.getString('check-out', false);

    // TODO Validate date here!?

    if (checkIn === null || checkOut === null) {
      await this.handleRandomCabinWithoutDates(interaction);
    } else {
      await this.handleRandomCabinWithDates(interaction, checkIn, checkOut);
    }
  }

  private async handleRandomCabinWithoutDates(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    const cabin = await this.cabinService.getRandomCabin();

    if (cabin === null) {
      await interaction.editReply(
        `I'm sorry, but looks like I could not find any cabin for you. :crying_cat_face:`,
      );
    } else {
      this.editReplyWithCabin(interaction, cabin);
    }
  }

  private async handleRandomCabinWithDates(
    interaction: ChatInputCommandInteraction<CacheType>,
    checkIn: string,
    checkOut: string,
  ): Promise<void> {
    const cabin = await this.cabinService.getRandomAvailableCabin(
      checkIn,
      checkOut,
    );

    if (cabin === null) {
      await interaction.editReply(
        `I'm sorry, but looks like I could not find any cabin for you. :crying_cat_face:`,
      );
    } else {
      this.editReplyWithCabin(interaction, cabin);
    }
  }

  // TODO can we reuse the method from bot service or write one that can be used by both modules? Maybe in cabin service or cabin database service?
  private async buildCabinEmbed(cabin: CabinSummary): Promise<EmbedBuilder> {
    const text = convert(cabin.description);
    const imageUrl = `https://res.cloudinary.com/ntb/image/upload/w_1280,q_80/v1/${cabin.media[0].uri}`;

    const embed = new EmbedBuilder()
      .setColor(0xd82d20)
      .setTitle(cabin.name)
      .setURL(`https://ut.no/hytte/${cabin.utId}`)
      .setDescription(text.split('\n')[0] + '...')
      .setImage(imageUrl);

    return embed;
  }

  private async editReplyWithCabin(
    interaction: ChatInputCommandInteraction<CacheType>,
    cabin: CabinSummary,
  ): Promise<void> {
    const embed = await this.buildCabinEmbed(cabin);
    await interaction.editReply({
      content: `How about going to ${cabin.name}? :heart_eyes_cat:`,
      embeds: [embed],
    });
  }
}

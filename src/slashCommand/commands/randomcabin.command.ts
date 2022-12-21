import { Injectable } from '@nestjs/common';
import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from 'discord.js';
import { CabinService } from 'src/cabin/cabin.service';
import { CabinSummary } from 'src/cabinDatabase/cabinDatabase.interface';
import { EmbedService } from 'src/embed/embed.service';
import { BaseCommand } from '../slashCommand.interface';
import { BookingDates, BookingDatesSchema } from './randomcabin.utils';

@Injectable()
export default class RandomCabinCommand implements BaseCommand {
  public readonly name: string;
  public readonly slashCommandBuilder: RESTPostAPIApplicationCommandsJSONBody;

  constructor(
    private readonly cabinService: CabinService,
    private readonly embedService: EmbedService,
  ) {
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
      )
      .toJSON();
  }

  public async handleCommand(
    interaction: ChatInputCommandInteraction<CacheType>,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const checkIn = interaction.options.getString('check-in', false);
    const checkOut = interaction.options.getString('check-out', false);

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
    checkIn: string | null,
    checkOut: string | null,
  ): Promise<void> {
    const bookingDates = await new BookingDatesSchema().validate(
      checkIn,
      checkOut,
    );

    if (!bookingDates) {
      await interaction.editReply(
        `Looks like there's something wrong with your dates.`,
      );
      return;
    }

    const cabin = await this.cabinService.getRandomAvailableCabin(bookingDates);

    if (cabin === null) {
      await interaction.editReply(
        `I'm sorry, but looks like I could not find any cabin for you. :crying_cat_face:`,
      );
    } else {
      this.editReplyWithCabin(interaction, cabin, bookingDates);
    }
  }

  private async editReplyWithCabin(
    interaction: ChatInputCommandInteraction<CacheType>,
    cabin: CabinSummary,
    bookingDates?: BookingDates,
  ): Promise<void> {
    const embeds: EmbedBuilder[] = [];
    embeds.push(await this.embedService.buildCabinEmbed(cabin));
    if (cabin.bookingUrl) {
      embeds.push(await this.embedService.buildBookingEmbed(cabin));
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const messageContent =
      bookingDates === undefined
        ? `How about going to ${cabin.name}? :heart_eyes_cat:`
        : `How about going to ${
            cabin.name
          } from ${bookingDates.checkIn.toLocaleDateString(
            'en-GB',
            dateOptions,
          )} to ${bookingDates.checkOut.toLocaleDateString(
            'en-GB',
            dateOptions,
          )}? :heart_eyes_cat:`;

    await interaction.editReply({
      content: messageContent,
      embeds: embeds,
    });
  }
}

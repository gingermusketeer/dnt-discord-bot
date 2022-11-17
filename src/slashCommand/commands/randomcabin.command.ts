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
import { BookingDates, BookingDatesSchema } from './randomcabin.utils';

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

    if (bookingDates === undefined) {
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

  private async buildBookingEmbed({
    bookingUrl,
    name,
  }: CabinSummary): Promise<EmbedBuilder> {
    const title = `:point_right: Book ${name} now!`;
    const embed = new EmbedBuilder()
      .setColor(0xd82d20)
      .setTitle(title)
      .setURL(bookingUrl);

    return embed;
  }

  private async editReplyWithCabin(
    interaction: ChatInputCommandInteraction<CacheType>,
    cabin: CabinSummary,
    bookingDates?: BookingDates,
  ): Promise<void> {
    const cabinEmbed = await this.buildCabinEmbed(cabin);
    const bookingEmbed = await this.buildBookingEmbed(cabin);

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
      embeds: [cabinEmbed, bookingEmbed],
    });
  }
}

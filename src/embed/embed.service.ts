import { Injectable } from '@nestjs/common';
import { convert } from 'html-to-text';
import { EmbedBuilder } from 'discord.js';
import { CabinSummary } from 'src/cabinDatabase/cabinDatabase.interface';

@Injectable()
export class EmbedService {
  async buildCabinEmbed(cabin: CabinSummary): Promise<EmbedBuilder> {
    const text = convert(cabin.description);
    const imageUrl = `https://res.cloudinary.com/ntb/image/upload/w_1280,q_80/v1/${cabin.media[0].uri}`;

    const embed = new EmbedBuilder()
      .setColor(0xd82d20)
      .setTitle(cabin.name)
      .setURL(`https://ut.no/hytte/${cabin.utId}`)
      .setDescription(text.split('\n')[0] + '...')
      .setThumbnail(
        'https://cdn.dnt.org/prod/sherpa/build/permanent/static/img/common/header-logo-part.png',
      )
      .setImage(imageUrl)
      .setTimestamp();

    return embed;
  }

  async buildBookingEmbed({
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
}

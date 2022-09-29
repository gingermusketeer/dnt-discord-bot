import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscordService } from 'src/discord/discord.service';
import * as cron from 'node-cron';
import { convert } from 'html-to-text';
import { EmbedBuilder } from 'discord.js';
import { CabinService } from 'src/cabin/cabin.service';

@Injectable()
export class BotService implements OnModuleInit {
  constructor(
    private readonly discordService: DiscordService,
    private readonly cabinService: CabinService,
  ) {}
  private task: cron.ScheduledTask;
  async onModuleInit() {
    this.task = cron.schedule('0 8 * * *', this.on8am);
    console.log('setup 8am cabin message');
  }

  on8am = () => {
    console.log('on8am');
    this.sendDailyCabin()
      .then(() => {
        console.log('Cabin Message sent');
      })
      .catch((error) => {
        console.error('Sending cabin message failed', error);
      });
  };

  async sendDailyCabin() {
    const channelId = '990712194842902635';
    const cabin = await this.cabinService.getRandomCabin();
    const text = convert(cabin.description);

    const imageUrl = `https://res.cloudinary.com/ntb/image/upload/w_1280,q_80/v1/${cabin.media[0].uri}`;
    const embed = new EmbedBuilder()
      .setColor(0xd82d20)
      .setTitle(`Dagens Hytta - ${cabin.name}`)
      .setURL(`https://ut.no/hytte/${cabin.id}`)
      .setDescription(text.split('\n')[0] + '...')
      .setThumbnail(
        'https://cdn.dnt.org/prod/sherpa/build/permanent/static/img/common/header-logo-part.png',
      )
      .setImage(imageUrl)
      .setTimestamp();
    await this.discordService.sendMessage(channelId, embed);
  }
}

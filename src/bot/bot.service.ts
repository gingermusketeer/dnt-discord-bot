import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscordService } from 'src/discord/discord.service';
import * as cron from 'node-cron';
import { convert } from 'html-to-text';
import { EmbedBuilder } from 'discord.js';
import { CabinService } from 'src/cabin/cabin.service';
import { ConfigService } from '@nestjs/config';
import { ActivityDatabaseService } from 'src/activityDatabase/activityDatabase.service';
import { SupabaseRealtimePayload } from '@supabase/supabase-js';
import { ActivityData } from 'src/activity/activity.interface';
import { CabinSummary } from 'src/cabinDatabase/cabinDatabase.interface';

@Injectable()
export class BotService implements OnModuleInit {
  private readonly newActivityChannelId: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly discordService: DiscordService,
    private readonly cabinService: CabinService,
    private readonly activityDatabaseService: ActivityDatabaseService,
  ) {
    this.newActivityChannelId = this.configService.getOrThrow(
      'DISCORD_NEW_ACTIVITY_CHANNEL_ID',
    );
  }
  private task: cron.ScheduledTask;
  async onModuleInit() {
    if (this.configService.get('NODE_ENV') === 'production') {
      this.task = cron.schedule('0 8 * * *', this.on8am);
      console.log('setup 8am cabin message');
      await this.activityDatabaseService.registerEventListener(
        'activities',
        'INSERT',
        this.onNewEvent,
      );
      console.log('setup handler for new activities');
    }
  }

  onNewEvent = (data: SupabaseRealtimePayload<ActivityData>) => {
    const imageUrl: string | undefined = data.new.media[0]?.url;
    const embed = new EmbedBuilder()
      .setColor(0xd82d20)
      .setTitle(`Noe nytt - ${data.new.title}`)
      .setURL(data.new.url)
      .setDescription(data.new.descriptionNb?.split('\n')[0] + '...')
      .setThumbnail(
        'https://cdn.dnt.org/prod/sherpa/build/permanent/static/img/common/header-logo-part.png',
      )
      .setImage(imageUrl)
      .setTimestamp();
    this.discordService
      .sendMessage(this.newActivityChannelId, '', embed)
      .catch((error) => {
        console.error('failed to send onNewEvent message', error);
      });
  };

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
    const channelId = this.configService.getOrThrow(
      'DISCORD_DAILY_CABIN_CHANNEL_ID',
    );
    const cabin = await this.cabinService.getRandomCabin();
    if (cabin === null) return;

    const messageContent = 'Dagens hytte :house_with_garden:';
    const embed = await this.buildCabinEmbed(cabin);
    await this.discordService.sendMessage(channelId, messageContent, embed);
  }

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

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import * as cron from 'node-cron';

@Injectable()
export class DiscordService {
  private readonly client: Client;
  private task: cron.ScheduledTask;
  constructor(configService: ConfigService) {
    console.log('Created');

    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

    this.client.on('ready', () => {
      console.log(`Logged in as ${this.client.user?.tag}!`);
      console.log(this.client.channels.cache.entries());
      if ('false' + 1 === 'true') {
        this.task = cron.schedule('* * * * *', this.onMinute);
      }
      this.onMinute();
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
      }
    });

    this.client.login(configService.getOrThrow('DISCORD_TOKEN'));
  }
  getHello(): string {
    return 'Hello World!';
  }

  onMinute = () => {
    console.log('every minute');
    this.sendMessage()
      .then(() => {
        console.log('Message sent');
      })
      .catch((error) => {
        console.error('Send message failed', error);
      });
  };

  async sendMessage() {
    const channel = await this.client.channels.fetch('1015984126651793458');
    if (!channel) {
      return;
    }
    if (channel.isTextBased()) {
      const embed = new EmbedBuilder()
        .setColor(0xd82d20)
        .setTitle('Dagens Hytta - Geitungen fyr')
        .setURL('https://ut.no/hytte/10386/geitungen-fyr')
        // .setAuthor({
        //   name: 'Some name',
        //   iconURL: 'https://i.imgur.com/AfFp7pu.png',
        //   url: 'https://discord.js.org',
        // })
        .setDescription(
          'Unik overnatting på øya utenfor Skudeneshavn på Karmøy, som huser Geitungen fyr, som eneste bolig. Haugesund Turistforening driver fyrvokterboligen som turisthytte på linje med andre hytter som foreningen disponerer. Hytta er åpen i perioden 1. mai til 30. september. ',
        )
        .setThumbnail(
          'https://cdn.dnt.org/prod/sherpa/build/permanent/static/img/common/header-logo-part.png',
        )
        // .addFields(
        //   { name: 'Regular field title', value: 'Some value here' },
        //   { name: '\u200B', value: '\u200B' },
        //   {
        //     name: 'Inline field title',
        //     value: 'Some value here',
        //     inline: true,
        //   },
        //   {
        //     name: 'Inline field title',
        //     value: 'Some value here',
        //     inline: true,
        //   },
        // )
        // .addFields({
        //   name: 'Inline field title',
        //   value: 'Some value here',
        //   inline: true,
        // })
        .setImage(
          'https://res.cloudinary.com/ntb/image/upload/w_1280,q_80/v1/cabins/eidlrui481lox0ittb8s',
        )
        .setTimestamp();
      // .setFooter({
      //   text: 'Some footer text here',
      //   iconURL: 'https://i.imgur.com/AfFp7pu.png',
      // });
      channel.send({ embeds: [embed] });
    }
  }
}

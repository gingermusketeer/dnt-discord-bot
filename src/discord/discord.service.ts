import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';
import * as cron from 'node-cron';
import { CabinService } from 'src/cabin/cabin.service';
import { convert } from 'html-to-text';

@Injectable()
export class DiscordService {
  private readonly client: Client;
  private task: cron.ScheduledTask;
  constructor(
    configService: ConfigService,
    private readonly cabinService: CabinService,
  ) {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

    this.client.on('ready', () => {
      console.log('discord ready');
      this.task = cron.schedule('0 8 * * *', this.on8am);
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
      }
    });

    this.client.login(configService.getOrThrow('DISCORD_TOKEN'));
  }

  on8am = () => {
    console.log('on8am');
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
      const cabin = await this.cabinService.getRandomCabin();
      console.log(cabin);
      const text = convert(cabin.description);

      const imageUrl = `https://res.cloudinary.com/ntb/image/upload/w_1280,q_80/v1/${cabin.media[0].uri}`;
      const embed = new EmbedBuilder()
        .setColor(0xd82d20)
        .setTitle(`Dagens Hytta - ${cabin.name}`)
        .setURL(`https://ut.no/hytte/${cabin.id}`)
        .setDescription(text.split('\n')[0])
        .setThumbnail(
          'https://cdn.dnt.org/prod/sherpa/build/permanent/static/img/common/header-logo-part.png',
        )
        .setImage(imageUrl)
        .setTimestamp();

      channel.send({ embeds: [embed] });
    }
  }
}

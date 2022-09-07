import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits } from 'discord.js';
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
      this.task = cron.schedule('* * * * *', this.onMinute);
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
    //@ts-ignore
    channel.send('hi there');
  }
}

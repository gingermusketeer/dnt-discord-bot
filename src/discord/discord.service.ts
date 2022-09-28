import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, EmbedBuilder, GatewayIntentBits } from 'discord.js';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;

  constructor(private readonly configService: ConfigService) {}
  async onModuleInit() {
    this.client = new Client({ intents: [GatewayIntentBits.Guilds] });

    this.client.on('ready', () => {
      console.log('discord ready');
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      if (interaction.commandName === 'ping') {
        await interaction.reply('Pong!');
      }
    });
    await this.client.login(this.configService.getOrThrow('DISCORD_TOKEN'));
    await this.getChannels();
  }

  async sendMessage(channelId: string, embed: EmbedBuilder) {
    const channel = await this.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      console.log('channel not found');
      return false;
    }

    await channel.send({ embeds: [embed] });
  }

  async getChannels() {
    const guild = await this.client.guilds.fetch('990712194842902629');
    const channels = await guild.channels.fetch();
    console.log(
      Array.from(channels.entries()).map(([id, channel]) => {
        return { name: channel?.name, id };
      }),
    );
  }
}

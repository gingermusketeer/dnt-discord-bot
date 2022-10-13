import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  DMChannel,
  EmbedBuilder,
  GatewayIntentBits,
  Interaction,
  Message,
  Partials,
  TextChannel,
} from 'discord.js';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
      ],
      partials: [Partials.Channel],
    });

    this.client.on('ready', () => {
      console.log('discord ready');
    });

    this.client.on('interactionCreate', this.onInteractionCreate);

    this.client.on('messageCreate', this.onMessageCreate);

    await this.client.login(this.configService.getOrThrow('DISCORD_TOKEN'));
    await this.getChannels();
  }

  onMessageCreate = (msg: Message) => {
    this.processMessage(msg).catch((error) => {
      console.error('failed to process message', error);
    });
  };

  async processMessage(msg: Message) {
    if (msg.author.bot) return;

    const isFromTestChannel =
      msg.channelId ===
      this.configService.getOrThrow('DISCORD_BOT_TESTING_CHANNEL_ID');
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (
      msg.channel instanceof TextChannel &&
      (isFromTestChannel || isProduction)
    ) {
      await this.handleTextChannelMessage(msg);
    }

    if (msg.channel instanceof DMChannel) {
      await this.handleDm(msg);
    }
  }

  onInteractionCreate = async (interaction: Interaction) => {
    this.processInteraction(interaction).catch((error) => {
      console.error('failed to process interaction', error);
    });
  };

  async processInteraction(interaction: Interaction) {
    //TODO Can we extract this to a new file? Maybe echo.service.ts or echo.module.ts etc?
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
      await interaction.reply('Pong!');
    }

    if (commandName === 'echo') {
      const message = interaction.options.getString('message', true);
      await interaction.reply(message);
    }
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
    const guild = await this.client.guilds.fetch(
      this.configService.getOrThrow('DISCORD_SERVER_ID'),
    );
    const channels = await guild.channels.fetch();
    console.log(
      Array.from(channels.entries()).map(([id, channel]) => {
        return { name: channel?.name, id };
      }),
    );
  }

  async handleTextChannelMessage(msg: Message<boolean>) {
    const botId = this.configService.getOrThrow('DISCORD_BOT_USER_ID');
    const botWasMentioned = msg.mentions.has(botId);

    if (botWasMentioned) {
      await msg.reply('Aye! :)');
    }
  }

  async handleDm(msg: Message<boolean>) {
    await msg.author.send(`Good to hear from you, ${msg.author.username}.`);
  }
}

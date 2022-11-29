import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  DMChannel,
  EmbedBuilder,
  GatewayIntentBits,
  Message,
  Partials,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  TextChannel,
} from 'discord.js';
import { SlashCommandService } from 'src/slashCommand/slashCommand.service';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;
  private rest: REST;

  private readonly botId = this.configService.getOrThrow('DISCORD_BOT_USER_ID');
  private readonly discordToken =
    this.configService.getOrThrow('DISCORD_TOKEN');
  private readonly guildId = this.configService.getOrThrow('DISCORD_SERVER_ID');
  private readonly testingChannelId = this.configService.getOrThrow(
    'DISCORD_BOT_TESTING_CHANNEL_ID',
  );
  private readonly environment = this.configService.get('NODE_ENV');

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => SlashCommandService))
    private readonly slashCommandService: SlashCommandService,
  ) {}

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

    this.client.on(
      'interactionCreate',
      this.slashCommandService.onInteractionCreate,
    );

    this.client.on('messageCreate', this.onMessageCreate);

    await this.client.login(this.discordToken);
    await this.getChannels();
  }

  onMessageCreate = (msg: Message) => {
    this.processMessage(msg).catch((error) => {
      console.error('failed to process message', error);
    });
  };

  onSlashCommandRefresh(commands: RESTPostAPIApplicationCommandsJSONBody[]) {
    this.rest = new REST({ version: '10' }).setToken(this.discordToken);

    this.deleteGlobalCommands()
      .catch((error) =>
        console.error('Failed to delete global slash commands', error),
      )
      .then(() => this.deleteGuildCommands())
      .catch((error) =>
        console.error('Failed to delete guild slash commands', error),
      )
      .then(() => this.registerSlashCommands(commands))
      .catch((error) =>
        console.error('Failed to refresh slash commands', error),
      );
  }

  async processMessage(msg: Message) {
    if (msg.author.bot) return;

    const REPLY = 19;
    if (msg.type === REPLY) {
      const referencedMessage = await msg.fetchReference();
      if (referencedMessage.author.id === this.botId) return;
    }

    const isFromTestChannel = msg.channelId === this.testingChannelId;
    const isProduction = this.environment === 'production';

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

  async handleTextChannelMessage(msg: Message<boolean>) {
    const botWasMentioned = msg.mentions.has(this.botId);

    if (botWasMentioned) {
      await msg.reply('Aye! :)');
    }
  }

  async handleDm(msg: Message<boolean>) {
    await msg.author.send(`Good to hear from you, ${msg.author.username}.`);
  }

  private async registerSlashCommands(
    commands: RESTPostAPIApplicationCommandsJSONBody[],
  ) {
    if (this.environment === 'production') {
      await this.registerGlobalCommands(commands);
    }

    await this.registerGuildCommands(commands);
  }

  private async registerGlobalCommands(
    commands: RESTPostAPIApplicationCommandsJSONBody[],
  ) {
    if (commands.length === 0) {
      console.log('Deleting global application (/) commands...');
    } else {
      console.log(
        `Registering ${commands.length} global application (/) commands...`,
      );
    }
    await this.rest.put(Routes.applicationCommands(this.botId), {
      body: commands,
    });
    console.log(`...done!`);
  }

  private async registerGuildCommands(
    commands: RESTPostAPIApplicationCommandsJSONBody[],
  ) {
    if (commands.length === 0) {
      console.log('Deleting guild application (/) commands...');
    } else {
      console.log(
        `Registering ${commands.length} guild application (/) commands...`,
      );
    }

    await this.rest.put(
      Routes.applicationGuildCommands(this.botId, this.guildId),
      {
        body: commands,
      },
    );

    console.log(`...done!`);
  }

  private async deleteGlobalCommands() {
    await this.registerGlobalCommands([]);
  }

  private async deleteGuildCommands() {
    await this.registerGuildCommands([]);
  }

  async sendMessage(
    channelId: string,
    messageContent: string,
    embed: EmbedBuilder,
  ) {
    const channel = await this.client.channels.fetch(channelId);
    if (!channel || !channel.isTextBased()) {
      console.log('channel not found');
      return false;
    }

    await channel.send({ content: messageContent, embeds: [embed] });
  }

  async getChannels() {
    const guild = await this.client.guilds.fetch(this.guildId);
    const channels = await guild.channels.fetch();
    console.log(
      Array.from(channels.entries()).map(([id, channel]) => {
        return { name: channel?.name, id };
      }),
    );
  }
}

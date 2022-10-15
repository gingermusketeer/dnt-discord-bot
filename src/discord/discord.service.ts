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
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  TextChannel,
} from 'discord.js';
import { BaseCommand } from 'src/slashCommand/slashCommand.interface';

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

    await this.client.login(this.discordToken);
    await this.getChannels();
  }

  onMessageCreate = (msg: Message) => {
    this.processMessage(msg).catch((error) => {
      console.error('failed to process message', error);
    });
  };

  onInteractionCreate = (interaction: Interaction) => {
    this.processInteraction(interaction).catch((error) => {
      console.error('failed to process interaction', error);
    });
  };

  onSlashCommandRefresh(commands: RESTPostAPIApplicationCommandsJSONBody[]) {
    this.refreshSlashCommands(commands).catch((error) =>
      console.error('Failed to refresh slash commands', error),
    );
  }

  async processMessage(msg: Message) {
    if (msg.author.bot) return;

    const isFromTestChannel = msg.channelId === this.testingChannelId;
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

  async processInteraction(interaction: Interaction) {
    //TODO Can we extract this to a new file? Maybe echo.service.ts or echo.module.ts etc?
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    // TODO dynamic import of module with corresponding name
    const path = `${__dirname}/commands/${commandName}.command.js`;
    const command: { default: BaseCommand } = await import(path);
    console.log(command);

    await command.default.handleCommand(interaction);
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

  private async refreshSlashCommands(
    commands: RESTPostAPIApplicationCommandsJSONBody[],
  ) {
    this.rest = new REST({ version: '10' }).setToken(this.discordToken);

    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );

    const data: any = await this.rest.put(
      Routes.applicationCommands(this.botId),
      {
        body: commands,
      },
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
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
    const guild = await this.client.guilds.fetch(this.guildId);
    const channels = await guild.channels.fetch();
    console.log(
      Array.from(channels.entries()).map(([id, channel]) => {
        return { name: channel?.name, id };
      }),
    );
  }
}

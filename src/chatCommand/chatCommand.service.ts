import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';

@Injectable()
export class ChatCommandService {
  private rest: REST;

  private readonly botId = this.configService.getOrThrow('DISCORD_BOT_USER_ID');
  private readonly discordToken =
    this.configService.getOrThrow('DISCORD_TOKEN');
  private readonly guildId = this.configService.getOrThrow('DISCORD_SERVER_ID');
  private readonly environment = this.configService.get('NODE_ENV');

  constructor(private readonly configService: ConfigService) {}

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
}

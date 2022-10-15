import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from 'discord.js';
import * as fs from 'fs';
import { BaseCommand } from './slashCommand.module';

@Injectable()
export class SlashCommandService implements OnModuleInit {
  private rest: REST;
  private commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  private readonly botId: string = this.configService.getOrThrow(
    'DISCORD_BOT_USER_ID',
  );
  private readonly commandPath = `${__dirname}/commands`;
  private readonly discordToken =
    this.configService.getOrThrow('DISCORD_TOKEN');

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.commands = await this.importCommands(this.commandPath);

    this.refreshSlashCommands().catch((error) =>
      console.error('Failed to refresh slash commands', error),
    );
  }

  async refreshSlashCommands() {
    this.rest = new REST({ version: '10' }).setToken(this.discordToken);

    console.log(
      `Started refreshing ${this.commands.length} application (/) commands.`,
    );

    const data: any = await this.rest.put(
      Routes.applicationCommands(this.botId),
      {
        body: this.commands,
      },
    );

    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  }

  async importCommands(
    commandPath: string,
  ): Promise<RESTPostAPIApplicationCommandsJSONBody[]> {
    const commandFiles = fs
      .readdirSync(commandPath)
      .filter((file) => file.endsWith('.command.js'));

    const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

    for (const file of commandFiles) {
      const path = `${commandPath}/${file}`;
      const command: { default: BaseCommand } = await import(path);
      commands.push(command.default.slashCommandBuilder.toJSON());
    }

    return commands;
  }
}

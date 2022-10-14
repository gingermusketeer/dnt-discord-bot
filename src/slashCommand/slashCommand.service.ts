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
  private commands: RESTPostAPIApplicationCommandsJSONBody[];
  private botId: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.botId = this.configService.getOrThrow('DISCORD_BOT_USER_ID');

    this.rest = new REST({ version: '10' }).setToken(
      this.configService.getOrThrow('DISCORD_TOKEN'),
    );

    this.commands = [];
    const commandPath = `${__dirname}/commands`;
    this.commands = await this.importCommands(commandPath);

    console.log(this.commands);

    try {
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
    } catch (error) {
      console.error(error);
    }
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
      console.log(command);
      commands.push(command.default.slashCommandBuilder.toJSON());
    }

    return commands;
  }
}

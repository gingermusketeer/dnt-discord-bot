import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord.js';
import * as fs from 'fs';
import { DiscordService } from 'src/discord/discord.service';
import { BaseCommand } from './slashCommand.interface';

@Injectable()
export class SlashCommandService implements OnModuleInit {
  private commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  private readonly commandPath = `${__dirname}/commands`;

  constructor(
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {}

  async onModuleInit() {
    this.commands = await this.importCommands(this.commandPath);

    this.discordService.onSlashCommandRefresh(this.commands);
  }

  async getCommand(commandName: string): Promise<BaseCommand | undefined> {
    const path = `${__dirname}/../slashCommand/commands/${commandName}.command.js`;

    if (!fs.existsSync(path)) {
      return undefined;
    }

    const command: { default: BaseCommand } = await import(path);
    return command.default;
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

import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  Interaction,
  RESTPostAPIApplicationCommandsJSONBody,
} from 'discord.js';
import { DiscordService } from 'src/discord/discord.service';
import PingCommand from './commands/ping.command';
import PspspsCommand from './commands/pspsps.command';
import RandomCabinCommand from './commands/randomcabin.command';
import { BaseCommand } from './slashCommand.interface';

@Injectable()
export class SlashCommandService implements OnModuleInit {
  private slashCommands: BaseCommand[];

  constructor(
    @Inject(forwardRef(() => DiscordService))
    private readonly discordService: DiscordService,
  ) {
    this.slashCommands = [
      new PingCommand(),
      new PspspsCommand(),
      new RandomCabinCommand(),
    ];
  }

  onModuleInit() {
    const slashCommandJson = this.generateSlashCommandJson();
    this.discordService.onSlashCommandRefresh(slashCommandJson);
  }

  onInteractionCreate = (interaction: Interaction) => {
    this.processInteraction(interaction).catch((error) => {
      console.error('failed to process interaction', error);
    });
  };

  async processInteraction(interaction: Interaction) {
    if (!interaction.isChatInputCommand()) return;

    for (const command of this.slashCommands) {
      if (command.name === interaction.commandName) {
        await command.handleCommand(interaction);
      }
    }
  }

  generateSlashCommandJson(): RESTPostAPIApplicationCommandsJSONBody[] {
    const slashCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
    for (const command of this.slashCommands) {
      slashCommands.push(command.slashCommandBuilder.toJSON());
    }
    return slashCommands;
  }
}

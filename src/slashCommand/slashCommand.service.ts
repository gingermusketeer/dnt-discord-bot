import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REST, Routes } from 'discord.js';
import * as fs from 'fs';

@Injectable()
export class SlashCommandService implements OnModuleInit {
  private rest: REST;
  private commands: [];
  private botId: string;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.botId = this.configService.getOrThrow('DISCORD_BOT_USER_ID');

    this.rest = new REST({ version: '10' }).setToken(
      this.configService.getOrThrow('DISCORD_TOKEN'),
    );

    const commandFiles = fs
      .readdirSync('./commands')
      .filter((file) => file.endsWith('.command.ts'));

    for (const file of commandFiles) {
      const command = await import(`./commands/${file}`); // TODO Type?
      this.commands.push(command.data.toJSON());
    }

    async () => {
      try {
        console.log(
          `Started refreshing ${this.commands.length} application (/) commands.`,
        );

        // TODO Type?
        const data = await this.rest.put(
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
    };
  }
}

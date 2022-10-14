import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlashCommandBuilder } from 'discord.js';
import { SlashCommandService } from './slashCommand.service';

export interface BaseCommand {
  slashCommandBuilder: Omit<
    SlashCommandBuilder,
    'addSubcommand' | 'addSubcommandGroup'
  >;
}

@Module({
  imports: [ConfigModule],
  providers: [SlashCommandService],
  exports: [SlashCommandService],
})
export class SlashCommandModule {}

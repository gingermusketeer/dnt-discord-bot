import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ConfigModule } from '@nestjs/config';
import { SlashCommandModule } from 'src/slashCommand/slashCommand.module';

@Module({
  imports: [ConfigModule, SlashCommandModule],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}

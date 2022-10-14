import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ConfigModule } from '@nestjs/config';
import { CabinModule } from 'src/cabin/cabin.module';
import { SlashCommandModule } from 'src/slashCommand/slashCommand.module';

@Module({
  imports: [ConfigModule, CabinModule, SlashCommandModule], // TODO SlashCommandModule is not needed every time?!
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}

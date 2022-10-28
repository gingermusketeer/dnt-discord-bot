import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityDatabaseModule } from 'src/activityDatabase/activityDatabase.module';
import { CabinUtModule } from 'src/cabinUt/cabinUt.module';
import { DiscordModule } from 'src/discord/discord.module';
import { SlashCommandModule } from 'src/slashCommand/slashCommand.module';
import { BotService } from './bot.service';

@Module({
  imports: [
    ActivityDatabaseModule,
    ConfigModule,
    DiscordModule,
    CabinUtModule,
    SlashCommandModule,
  ],
  providers: [BotService],
})
export class BotModule {}

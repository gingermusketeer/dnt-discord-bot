import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityDatabaseModule } from 'src/activityDatabase/activityDatabase.module';
import { CabinModule } from 'src/cabin/cabin.module';
import { DiscordModule } from 'src/discord/discord.module';
import { SlashCommandModule } from 'src/slashCommand/slashCommand.module';
import { BotService } from './bot.service';

@Module({
  imports: [
    ActivityDatabaseModule,
    ConfigModule,
    DiscordModule,
    CabinModule,
    SlashCommandModule,
  ],
  providers: [BotService],
})
export class BotModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ActivityDatabaseModule } from 'src/activityDatabase/activityDatabase.module';
import { CabinModule } from 'src/cabin/cabin.module';
import { DiscordModule } from 'src/discord/discord.module';
import { EmbedModule } from 'src/embed/embed.module';
import { BotService } from './bot.service';

@Module({
  imports: [
    ActivityDatabaseModule,
    ConfigModule,
    DiscordModule,
    CabinModule,
    EmbedModule,
  ],
  providers: [BotService],
})
export class BotModule {}

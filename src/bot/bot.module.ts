import { Module } from '@nestjs/common';
import { CabinModule } from 'src/cabin/cabin.module';
import { DiscordModule } from 'src/discord/discord.module';
import { BotService } from './bot.service';

@Module({
  imports: [DiscordModule, CabinModule],
  providers: [BotService],
})
export class BotModule {}

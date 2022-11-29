import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BotModule } from 'src/bot/bot.module';
import { CabinModule } from 'src/cabin/cabin.module';
import { DiscordModule } from 'src/discord/discord.module';
import { SlashCommandService } from './slashCommand.service';

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => BotModule),
    CabinModule,
    forwardRef(() => DiscordModule),
  ],
  providers: [SlashCommandService],
  exports: [SlashCommandService],
})
export class SlashCommandModule {}

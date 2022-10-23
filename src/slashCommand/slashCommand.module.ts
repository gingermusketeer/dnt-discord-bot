import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordModule } from 'src/discord/discord.module';
import { SlashCommandService } from './slashCommand.service';

@Module({
  imports: [ConfigModule, forwardRef(() => DiscordModule)],
  providers: [SlashCommandService],
  exports: [SlashCommandService],
})
export class SlashCommandModule {}

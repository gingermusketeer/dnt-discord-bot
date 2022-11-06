import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CabinModule } from 'src/cabin/cabin.module';
import { DiscordModule } from 'src/discord/discord.module';
import { SlashCommandService } from './slashCommand.service';

@Module({
  imports: [ConfigModule, forwardRef(() => DiscordModule), CabinModule],
  providers: [SlashCommandService],
  exports: [SlashCommandService],
})
export class SlashCommandModule {}

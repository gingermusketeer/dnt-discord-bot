import { forwardRef, Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ConfigModule } from '@nestjs/config';
import { CabinModule } from 'src/cabin/cabin.module';
import { SlashCommandModule } from 'src/slashCommand/slashCommand.module';

@Module({
  imports: [ConfigModule, CabinModule, forwardRef(() => SlashCommandModule)],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}

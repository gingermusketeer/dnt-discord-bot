import { forwardRef, Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { ConfigModule } from '@nestjs/config';
import { CabinUtModule } from 'src/cabinUt/cabinUt.module';
import { SlashCommandModule } from 'src/slashCommand/slashCommand.module';

@Module({
  imports: [ConfigModule, CabinUtModule, forwardRef(() => SlashCommandModule)],
  providers: [DiscordService],
  exports: [DiscordService],
})
export class DiscordModule {}

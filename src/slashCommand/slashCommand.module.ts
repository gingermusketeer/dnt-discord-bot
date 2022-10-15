import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SlashCommandService } from './slashCommand.service';

@Module({
  imports: [ConfigModule],
  providers: [SlashCommandService],
  exports: [SlashCommandService],
})
export class SlashCommandModule {}

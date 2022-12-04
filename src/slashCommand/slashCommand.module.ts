import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CabinModule } from 'src/cabin/cabin.module';
import { ChatCommandModule } from 'src/chatCommand/chatCommand.module';
import { EmbedModule } from 'src/embed/embed.module';
import { SlashCommandService } from './slashCommand.service';

@Module({
  imports: [ConfigModule, CabinModule, EmbedModule, ChatCommandModule],
  providers: [SlashCommandService],
  exports: [SlashCommandService],
})
export class SlashCommandModule {}
